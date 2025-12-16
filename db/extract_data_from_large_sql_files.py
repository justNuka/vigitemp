import re
from pathlib import Path
from collections import defaultdict

# Configuration: tables à garder
WANTED = {
    "vigitemp_ifb": {"t_sonde_etat", "t_sonde_type", "t_sonde_type_mesure"},
    "vigitemp_mesures_ifb": {"ts_parametre"},
}

# Chemins
IN = Path(r"c:\Vigitemp project\db\Ancienne db\vigitemp_ifb_full_db_modifiee.sql")
OUT = Path(r"c:\Vigitemp project\db\Ancienne db\filtered.sql")

# Regex
re_db_comment = re.compile(r"Database:\s+(\S+)")
re_drop_table = re.compile(r"DROP\s+TABLE\s+IF\s+EXISTS\s+`([^`]+)`", re.IGNORECASE)
re_create_table = re.compile(r"CREATE\s+TABLE\s+`([^`]+)`", re.IGNORECASE)
re_lock_table = re.compile(r"LOCK\s+TABLES\s+`([^`]+)`", re.IGNORECASE)
re_insert = re.compile(r"INSERT\s+INTO\s+`([^`]+)`", re.IGNORECASE)
re_unlock = re.compile(r"UNLOCK\s+TABLES", re.IGNORECASE)

# Stats
stats = {
    'current_db': None,
    'tables_found': defaultdict(set),
    'tables_kept': defaultdict(set),
    'tables_skipped': defaultdict(set),
    'insert_lines': 0,
}

def is_wanted_table(table: str, db: str = None) -> bool:
    """Vérifier si la table doit être gardée"""
    if not db or db not in WANTED:
        return False
    wanted = WANTED[db]
    return wanted == "*" or table.lower() in {t.lower() for t in wanted}

# Déterminer la DB au démarrage
current_db = None
with IN.open("r", encoding="utf-8", errors="ignore") as f:
    for line in f:
        m = re_db_comment.search(line)
        if m:
            current_db = m.group(1).strip()
            break

if not current_db:
    print("❌ ERREUR: Impossible de détecter le nom de la base de données!")
    exit(1)

print("=" * 50)
print(f"FILTRAGE SQL MySQL - Base: {current_db}")
print("=" * 50)

keep_struct = False
keep_data = False
current_table = None
lines_processed = 0

with IN.open("r", encoding="utf-8", errors="ignore") as fin, OUT.open("w", encoding="utf-8", newline="\n") as fout:
    for line in fin:
        lines_processed += 1
        db = current_db
        
        # Déterminer si c'est la DB qu'on veut
        if db not in WANTED:
            # Garder les lignes d'en-tête et de configuration
            if line.startswith("/*") or line.startswith("--") or line.startswith("!"):
                fout.write(line)
            continue

        # === DROP TABLE ===
        m = re_drop_table.match(line.strip())
        if m:
            table = m.group(1)
            stats['tables_found'][db].add(table)
            keep_struct = is_wanted_table(table, db)
            current_table = table
            
            if keep_struct:
                stats['tables_kept'][db].add(table)
                print(f"  ✓ {table}")
                fout.write(line)
            else:
                stats['tables_skipped'][db].add(table)
            continue

        # === CREATE TABLE ===
        m = re_create_table.match(line.strip())
        if m:
            if keep_struct:
                fout.write(line)
            continue

        # === Fin de CREATE TABLE ===
        if keep_struct and line.strip().endswith(");"):
            fout.write(line)
            keep_struct = False
            current_table = None
            continue

        if keep_struct:
            fout.write(line)
            continue

        # === LOCK TABLES ===
        m = re_lock_table.match(line.strip())
        if m:
            table = m.group(1)
            keep_data = is_wanted_table(table, db)
            if keep_data:
                fout.write(line)
            continue

        # === INSERT INTO ===
        m = re_insert.match(line.strip())
        if m:
            table = m.group(1)
            if is_wanted_table(table, db):
                stats['insert_lines'] += 1
                fout.write(line)
            continue

        # === UNLOCK TABLES ===
        if re_unlock.match(line.strip()):
            if keep_data:
                fout.write(line)
            keep_data = False
            continue

        # Garder les commentaires et config de la DB voulue
        if db in WANTED and (line.startswith("/*") or line.startswith("--") or line.startswith("!")):
            fout.write(line)
            continue

print("\n" + "=" * 50)
print("RÉSUMÉ")
print("=" * 50)

print(f"\nSource: {IN}")
print(f"Destination: {OUT}")
print(f"Base de données: {current_db}")

print(f"\n📋 CONFIGURATION (tables attendues):")
for db, tables in WANTED.items():
    print(f"  {db}: {sorted(tables)}")

print(f"\n🔍 TROUVÉ DANS LE SQL:")
for db, tables in stats['tables_found'].items():
    print(f"  {db}: {sorted(tables)}")

print(f"\n✓ CONSERVÉES:")
for db, tables in stats['tables_kept'].items():
    print(f"  {db}: {sorted(tables)}")

print(f"\n✗ IGNORÉES:")
for db, tables in stats['tables_skipped'].items():
    if tables:
        print(f"  {db}: {sorted(tables)}")

print(f"\n📊 LIGNES:")
print(f"  Lignes traitées: {lines_processed}")
print(f"  INSERT écrites: {stats['insert_lines']}")

print(f"\n✅ Fichier généré: {OUT}")
