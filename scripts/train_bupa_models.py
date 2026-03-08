from __future__ import annotations

"""
Train and evaluate ML models on the BUPA liver dataset.

Examples:
  python3 scripts/train_bupa_models.py --source csv
  python3 scripts/train_bupa_models.py --source supabase
"""

import argparse
import json
import os
from pathlib import Path
from typing import Any

import joblib
from dotenv import load_dotenv
from sklearn.compose import TransformedTargetRegressor
from sklearn.ensemble import HistGradientBoostingClassifier, HistGradientBoostingRegressor, RandomForestClassifier, RandomForestRegressor
from sklearn.inspection import permutation_importance
from sklearn.linear_model import ElasticNet, LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import RepeatedKFold, RepeatedStratifiedKFold, cross_validate
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

load_dotenv()

CSV_COLUMNS = ["mcv", "alp", "alt", "ast", "ggt", "drinks", "selector"]
CLASSIFICATION_FEATURES = ["mcv", "alp", "alt", "ast", "ast_alt_ratio", "ggt", "drinks"]
REGRESSION_FEATURES = ["mcv", "alp", "alt", "ast", "ast_alt_ratio", "ggt", "selector"]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train BUPA baseline and challenger models")
    parser.add_argument(
        "--source",
        choices=["csv", "supabase"],
        default="csv",
        help="Data source: raw CSV file or Supabase table",
    )
    parser.add_argument(
        "--csv-path",
        default="data/bupa.data",
        help="Path to raw BUPA csv file (used when --source csv)",
    )
    parser.add_argument(
        "--dedupe",
        action="store_true",
        help="Drop duplicate rows based on all available columns",
    )
    parser.add_argument(
        "--output-dir",
        default="artifacts/ml",
        help="Directory for reports and serialized models",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed",
    )
    return parser.parse_args()


def load_records_from_csv(csv_path: Path) -> list[dict[str, float]]:
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV file not found: {csv_path}")

    rows: list[dict[str, float]] = []
    with csv_path.open("r", encoding="utf-8") as f:
        for line_no, line in enumerate(f, start=1):
            raw = line.strip()
            if not raw:
                continue

            parts = [p.strip() for p in raw.split(",")]
            if len(parts) != 7:
                print(f"Skipping line {line_no}: expected 7 fields, got {len(parts)}")
                continue

            try:
                mcv = float(parts[0])
                alp = float(parts[1])
                alt = float(parts[2])
                ast = float(parts[3])
                ggt = float(parts[4])
                drinks = float(parts[5])
                selector = int(float(parts[6]))
            except ValueError as exc:
                print(f"Skipping line {line_no}: parse error -> {exc}")
                continue

            ast_alt_ratio = ast / alt if alt != 0 else 0.0
            rows.append(
                {
                    "mcv": mcv,
                    "alp": alp,
                    "alt": alt,
                    "ast": ast,
                    "ast_alt_ratio": ast_alt_ratio,
                    "ggt": ggt,
                    "drinks": drinks,
                    "selector": selector,
                }
            )

    return rows


def load_records_from_supabase() -> list[dict[str, float]]:
    supabase_url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not service_key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for --source supabase")

    from supabase import create_client

    client = create_client(supabase_url, service_key)
    rows: list[dict[str, float]] = []
    page_size = 1000
    start = 0

    while True:
        end = start + page_size - 1
        response = (
            client.table("bupa_liver_records")
            .select("mcv,alp,alt,ast,ast_alt_ratio,ggt,drinks,selector")
            .range(start, end)
            .execute()
        )
        batch = response.data or []

        for item in batch:
            rows.append(
                {
                    "mcv": float(item["mcv"]),
                    "alp": float(item["alp"]),
                    "alt": float(item["alt"]),
                    "ast": float(item["ast"]),
                    "ast_alt_ratio": float(item["ast_alt_ratio"] or 0.0),
                    "ggt": float(item["ggt"]),
                    "drinks": float(item["drinks"]),
                    "selector": int(item["selector"]),
                }
            )

        if len(batch) < page_size:
            break

        start += page_size

    return rows


def maybe_dedupe(rows: list[dict[str, float]], dedupe: bool) -> list[dict[str, float]]:
    if not dedupe:
        return rows

    seen: set[tuple[Any, ...]] = set()
    unique: list[dict[str, float]] = []
    for row in rows:
        key = tuple(row[k] for k in ["mcv", "alp", "alt", "ast", "ast_alt_ratio", "ggt", "drinks", "selector"])
        if key in seen:
            continue
        seen.add(key)
        unique.append(row)

    return unique


def to_matrix(rows: list[dict[str, float]], features: list[str]) -> list[list[float]]:
    return [[float(row[col]) for col in features] for row in rows]


def round_metric(value: float) -> float:
    return round(float(value), 5)


def summarize_cv(cv_result: dict[str, Any]) -> dict[str, float]:
    summary: dict[str, float] = {}
    for key, values in cv_result.items():
        if not key.startswith("test_"):
            continue
        metric = key.replace("test_", "")
        arr = list(values)
        if not arr:
            continue
        summary[f"{metric}_mean"] = round_metric(sum(arr) / len(arr))
        centered = [(v - (sum(arr) / len(arr))) ** 2 for v in arr]
        std = (sum(centered) / len(arr)) ** 0.5
        summary[f"{metric}_std"] = round_metric(std)
    return summary


def train_selector_models(rows: list[dict[str, float]], seed: int) -> tuple[Pipeline | RandomForestClassifier | HistGradientBoostingClassifier, dict[str, Any]]:
    x = to_matrix(rows, CLASSIFICATION_FEATURES)
    y = [1 if int(r["selector"]) == 2 else 0 for r in rows]

    models: dict[str, Any] = {
        "logistic_regression": Pipeline(
            steps=[
                ("scaler", StandardScaler()),
                ("model", LogisticRegression(max_iter=2500, random_state=seed)),
            ]
        ),
        "random_forest": RandomForestClassifier(
            n_estimators=500,
            max_depth=None,
            min_samples_leaf=3,
            random_state=seed,
        ),
        "hist_gradient_boosting": HistGradientBoostingClassifier(
            max_depth=4,
            learning_rate=0.05,
            random_state=seed,
        ),
    }

    cv = RepeatedStratifiedKFold(n_splits=5, n_repeats=4, random_state=seed)
    scoring = ["roc_auc", "f1", "accuracy", "average_precision"]

    report: dict[str, Any] = {"task": "selector_classification", "models": {}}
    best_name = ""
    best_score = -1.0

    for name, model in models.items():
        result = cross_validate(model, x, y, scoring=scoring, cv=cv, n_jobs=-1)
        summary = summarize_cv(result)
        report["models"][name] = summary

        roc_auc = summary.get("roc_auc_mean", -1.0)
        if roc_auc > best_score:
            best_name = name
            best_score = roc_auc

    best_model = models[best_name]
    best_model.fit(x, y)

    report["best_model"] = best_name
    report["best_metric"] = "roc_auc_mean"
    report["best_metric_value"] = round_metric(best_score)
    report["label_definition"] = "positive_class=selector==2"

    selector_proba = None
    if hasattr(best_model, "predict_proba"):
        selector_proba = best_model.predict_proba(x)[:, 1]
        report["train_roc_auc"] = round_metric(roc_auc_score(y, selector_proba))

    importance = permutation_importance(
        best_model,
        x,
        y,
        scoring="roc_auc",
        n_repeats=20,
        random_state=seed,
        n_jobs=-1,
    )

    feature_importance = sorted(
        [
            {
                "feature": CLASSIFICATION_FEATURES[idx],
                "importance_mean": round_metric(importance.importances_mean[idx]),
                "importance_std": round_metric(importance.importances_std[idx]),
            }
            for idx in range(len(CLASSIFICATION_FEATURES))
        ],
        key=lambda item: item["importance_mean"],
        reverse=True,
    )

    report["top_features"] = feature_importance

    return best_model, report


def train_drinks_models(rows: list[dict[str, float]], seed: int) -> tuple[Any, dict[str, Any]]:
    x = to_matrix(rows, REGRESSION_FEATURES)
    y = [float(r["drinks"]) for r in rows]

    models: dict[str, Any] = {
        "elastic_net": Pipeline(
            steps=[
                ("scaler", StandardScaler()),
                (
                    "model",
                    ElasticNet(alpha=0.03, l1_ratio=0.35, random_state=seed),
                ),
            ]
        ),
        "random_forest_regressor": RandomForestRegressor(
            n_estimators=500,
            min_samples_leaf=2,
            random_state=seed,
        ),
        "hist_gradient_boosting_regressor": HistGradientBoostingRegressor(
            max_depth=4,
            learning_rate=0.05,
            random_state=seed,
        ),
    }

    cv = RepeatedKFold(n_splits=5, n_repeats=4, random_state=seed)
    scoring = ["neg_root_mean_squared_error", "neg_mean_absolute_error", "r2"]

    report: dict[str, Any] = {"task": "drinks_regression", "models": {}}
    best_name = ""
    best_rmse = float("inf")

    for name, model in models.items():
        result = cross_validate(model, x, y, scoring=scoring, cv=cv, n_jobs=-1)
        summary = summarize_cv(result)

        # Convert sklearn negative error metrics to positive errors.
        summary["rmse_mean"] = round_metric(abs(summary.pop("neg_root_mean_squared_error_mean")))
        summary["rmse_std"] = round_metric(summary.pop("neg_root_mean_squared_error_std"))
        summary["mae_mean"] = round_metric(abs(summary.pop("neg_mean_absolute_error_mean")))
        summary["mae_std"] = round_metric(summary.pop("neg_mean_absolute_error_std"))

        report["models"][name] = summary

        rmse = summary["rmse_mean"]
        if rmse < best_rmse:
            best_name = name
            best_rmse = rmse

    best_model = models[best_name]
    best_model.fit(x, y)

    report["best_model"] = best_name
    report["best_metric"] = "rmse_mean"
    report["best_metric_value"] = round_metric(best_rmse)

    return best_model, report


def main() -> None:
    args = parse_args()

    if args.source == "csv":
        rows = load_records_from_csv(Path(args.csv_path))
    else:
        rows = load_records_from_supabase()

    rows = maybe_dedupe(rows, args.dedupe)

    if len(rows) < 50:
        raise ValueError(f"Not enough rows for robust training: {len(rows)}")

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    selector_model, selector_report = train_selector_models(rows, args.seed)
    drinks_model, drinks_report = train_drinks_models(rows, args.seed)

    selector_model_path = output_dir / "selector_model.joblib"
    drinks_model_path = output_dir / "drinks_model.joblib"
    report_path = output_dir / "model_report.json"

    joblib.dump(selector_model, selector_model_path)
    joblib.dump(drinks_model, drinks_model_path)

    full_report = {
        "meta": {
            "source": args.source,
            "row_count": len(rows),
            "dedupe": bool(args.dedupe),
            "classification_features": CLASSIFICATION_FEATURES,
            "regression_features": REGRESSION_FEATURES,
        },
        "selector_classification": selector_report,
        "drinks_regression": drinks_report,
    }

    report_path.write_text(json.dumps(full_report, indent=2), encoding="utf-8")

    print("Training complete.")
    print(f"Saved selector model: {selector_model_path}")
    print(f"Saved drinks model:   {drinks_model_path}")
    print(f"Saved metrics report: {report_path}")


if __name__ == "__main__":
    main()
