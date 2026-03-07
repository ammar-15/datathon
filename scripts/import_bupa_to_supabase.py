from pathlib import Path
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env"
    )

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

DATA_FILE = Path("data/bupa.data")
TABLE_NAME = "bupa_liver_records"


def parse_bupa_file(file_path: Path) -> list[dict]:
    if not file_path.exists():
        raise FileNotFoundError(f"Data file not found: {file_path}")

    records: list[dict] = []

    with file_path.open("r", encoding="utf-8") as f:
        for line_number, raw_line in enumerate(f, start=1):
            line = raw_line.strip()

            if not line:
                continue

            parts = [p.strip() for p in line.split(",")]

            if len(parts) != 7:
                print(f"Skipping line {line_number}: expected 7 values, got {len(parts)}")
                continue

            try:
                record = {
                    "mcv": float(parts[0]),
                    "alkphos": float(parts[1]),
                    "sgpt": float(parts[2]),
                    "sgot": float(parts[3]),
                    "gammagt": float(parts[4]),
                    "drinks": float(parts[5]),
                    "selector": int(float(parts[6])),
                }
                records.append(record)
            except ValueError as e:
                print(f"Skipping line {line_number}: parse error -> {e}")

    return records


def dedupe_records(records: list[dict]) -> list[dict]:
    seen = set()
    unique_records = []

    for record in records:
        key = (
            record["mcv"],
            record["alkphos"],
            record["sgpt"],
            record["sgot"],
            record["gammagt"],
            record["drinks"],
            record["selector"],
        )
        if key not in seen:
            seen.add(key)
            unique_records.append(record)

    return unique_records


def chunk_list(items: list, chunk_size: int) -> list[list]:
    return [items[i:i + chunk_size] for i in range(0, len(items), chunk_size)]


def main() -> None:
    print(f"Reading dataset from {DATA_FILE}...")
    records = parse_bupa_file(DATA_FILE)

    if not records:
        print("No valid records found.")
        return

    print(f"Parsed {len(records)} records.")

    deduped_records = dedupe_records(records)
    removed = len(records) - len(deduped_records)

    if removed > 0:
        print(f"Removed {removed} duplicate records.")
    else:
        print("No duplicate records found.")

    existing = supabase.table(TABLE_NAME).select("id", count="exact").limit(1).execute()
    existing_count = existing.count or 0

    if existing_count > 0:
        print(f"Table '{TABLE_NAME}' already has {existing_count} rows.")
        confirm = input("Delete existing rows and re-import cleanly? (y/n): ").strip().lower()

        if confirm != "y":
            print("Import cancelled.")
            return

        delete_response = supabase.table(TABLE_NAME).delete().neq("id", 0).execute()
        print("Existing rows deleted.")

    batches = chunk_list(deduped_records, 100)
    inserted_total = 0

    for index, batch in enumerate(batches, start=1):
        supabase.table(TABLE_NAME).insert(batch).execute()
        inserted_total += len(batch)
        print(f"Inserted batch {index}/{len(batches)} ({len(batch)} rows)")

    print(f"Done. Inserted {inserted_total} total rows into '{TABLE_NAME}'.")


if __name__ == "__main__":
    main()