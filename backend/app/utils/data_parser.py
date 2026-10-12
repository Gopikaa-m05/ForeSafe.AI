import io
import os
import re
import csv
import math
import logging
from typing import Tuple, List, Dict, Any, Optional
import pandas as pd
import numpy as np

from app.ml.train import FEATURE_COLUMNS, FEATURE_DESCRIPTIONS

logger = logging.getLogger("software_failure.data_parser")

# Canonical NASA JM1 Feature Columns
CANONICAL_FEATURES = list(FEATURE_COLUMNS)

# Baseline empirical medians from NASA PROMISE JM1 benchmark dataset (10,885 software modules)
DEFAULT_FEATURE_MEDIANS = {
    "loc": 35.0,
    "v(g)": 5.0,
    "ev(g)": 2.0,
    "iv(g)": 3.0,
    "n": 160.0,
    "v": 900.0,
    "l": 0.08,
    "d": 14.0,
    "i": 60.0,
    "e": 14000.0,
    "b": 0.30,
    "t": 750.0,
    "lOCode": 26.0,
    "lOComment": 3.0,
    "lOBlank": 5.0,
    "locCodeAndComment": 0.0,
    "uniq_Op": 14.0,
    "uniq_Opnd": 24.0,
    "total_Op": 95.0,
    "total_Opnd": 65.0,
    "branchCount": 9.0
}

# Extensive alias map for intelligent column identification across different software engineering tools
COLUMN_ALIASES: Dict[str, List[str]] = {
    "loc": [
        "loc", "lines_of_code", "linesofcode", "sloc", "total_loc", "length",
        "mccabe_loc", "line_count", "lines", "lines_total", "code_size", "n_lines"
    ],
    "v(g)": [
        "v(g)", "vg", "v_g", "cyclomatic_complexity", "cyclomaticcomplexity",
        "cyclo", "cyclomatic", "cc", "mccabe_vg", "mccabe_v", "complexity",
        "mccabe_cyclomatic", "mccabe_complexity", "decision_complexity"
    ],
    "ev(g)": [
        "ev(g)", "evg", "ev_g", "essential_complexity", "essentialcomplexity",
        "essential", "mccabe_ev", "mccabe_essential"
    ],
    "iv(g)": [
        "iv(g)", "ivg", "iv_g", "design_complexity", "designcomplexity",
        "design", "mccabe_iv", "module_design_complexity", "mccabe_design"
    ],
    "n": [
        "n", "halstead_n", "halstead_length", "total_operators_and_operands",
        "total_tokens", "length_n", "total_oper_and_opnd", "halstead_token_count"
    ],
    "v": [
        "v", "halstead_v", "halstead_volume", "volume", "program_volume",
        "halstead_vol", "information_volume"
    ],
    "l": [
        "l", "halstead_l", "halstead_level", "level", "program_level",
        "halstead_lvl", "abstraction_level"
    ],
    "d": [
        "d", "halstead_d", "halstead_difficulty", "difficulty", "error_proneness",
        "program_difficulty", "halstead_diff"
    ],
    "i": [
        "i", "halstead_i", "halstead_intelligence", "intelligence",
        "info_content", "information_content", "intelligence_content"
    ],
    "e": [
        "e", "halstead_e", "halstead_effort", "effort", "mental_effort",
        "programming_effort", "effort_to_implement"
    ],
    "b": [
        "b", "halstead_b", "halstead_bugs", "bugs", "delivered_bugs",
        "bug_estimate", "defect_density", "expected_bugs", "estimated_bugs"
    ],
    "t": [
        "t", "halstead_t", "halstead_time", "time", "time_estimator",
        "time_to_program", "estimated_time", "programming_time_sec"
    ],
    "lOCode": [
        "locode", "lo_code", "lines_code", "code_lines", "executable_loc",
        "loc_code", "code_loc", "executable_lines", "loc_executable"
    ],
    "lOComment": [
        "locomment", "lo_comment", "lines_comment", "comment_lines", "comments",
        "comment_count", "loc_comment", "comment_loc", "comments_count"
    ],
    "lOBlank": [
        "loblank", "lo_blank", "lines_blank", "blank_lines", "blanks",
        "blank_count", "loc_blank", "blank_loc", "whitespace_lines"
    ],
    "locCodeAndComment": [
        "loccodeandcomment", "loc_code_and_comment", "code_and_comment",
        "both_code_comment", "loc_code_comment", "code_comment_lines",
        "loc_code_and_comments", "loccodecomment"
    ],
    "uniq_Op": [
        "uniq_op", "uniqop", "unique_operators", "unique_ops", "n1", "mu1",
        "num_unique_operators", "uniq_operators", "distinct_operators"
    ],
    "uniq_Opnd": [
        "uniq_opnd", "uniqopnd", "unique_operands", "unique_opnds", "n2", "mu2",
        "num_unique_operands", "uniq_operands", "distinct_operands"
    ],
    "total_Op": [
        "total_op", "totalop", "total_operators", "total_ops", "n_1", "n1_total",
        "total_operators_count", "num_total_operators", "operator_count"
    ],
    "total_Opnd": [
        "total_opnd", "totalopnd", "total_operands", "total_opnds", "n_2", "n2_total",
        "total_operands_count", "num_total_operands", "operand_count"
    ],
    "branchCount": [
        "branchcount", "branch_count", "branches", "num_branches",
        "decision_branches", "branch_total", "total_branches", "decision_count"
    ]
}

MODULE_NAME_ALIASES = [
    "module", "module_name", "modulename", "module_id", "name", "file",
    "filename", "file_name", "source_file", "sourcefile", "function",
    "function_name", "func_name", "func", "class", "class_name", "id",
    "method", "method_name", "component", "component_name", "unit",
    "unit_name", "path", "source_path", "package"
]

DEFECT_ALIASES = [
    "defects", "defect", "problems", "problem", "label", "class", "fault",
    "faults", "bug", "bugs", "is_defective", "target", "error", "has_bug", "fail"
]


def _normalize_header_str(col: str) -> str:
    """Normalizes string by stripping spaces, quotes, BOM, and lowering."""
    if not isinstance(col, str):
        col = str(col)
    # Remove BOM and non-alphanumeric noise except parentheses
    col = col.strip().lstrip("\ufeff").strip('"').strip("'")
    cleaned = re.sub(r'[\s\-_]+', '', col.lower())
    return cleaned


def parse_raw_bytes_to_df(contents: bytes, filename: str) -> pd.DataFrame:
    """
    Universally parses uploaded file contents into a pandas DataFrame.
    Supports CSV, TSV, TXT, Excel (.xlsx, .xls), JSON, ARFF/Weka format,
    handling various delimiters, encodings, and comment structures.
    """
    fn_lower = filename.lower().strip()
    
    # 1. Excel Formats (.xlsx, .xls)
    if fn_lower.endswith((".xlsx", ".xls")):
        try:
            df = pd.read_excel(io.BytesIO(contents))
            if not df.empty:
                return df
        except Exception as e:
            logger.warning(f"Excel parser failed for {filename}: {e}. Falling back to text decoders.")

    # 2. JSON Formats (.json)
    if fn_lower.endswith(".json"):
        try:
            df = pd.read_json(io.BytesIO(contents))
            if not df.empty:
                return df
        except Exception as e:
            logger.warning(f"JSON parser failed for {filename}: {e}. Falling back to text decoders.")

    # 3. Text Decoders (CSV, TSV, ARFF, TXT)
    candidate_encodings = ["utf-8-sig", "utf-8", "latin1", "iso-8859-1", "cp1252", "utf-16"]
    decoded_text = None
    
    for enc in candidate_encodings:
        try:
            decoded_text = contents.decode(enc)
            break
        except (UnicodeDecodeError, LookupError):
            continue
            
    if decoded_text is None:
        decoded_text = contents.decode("latin1", errors="replace")

    # Clean ARFF / Weka annotations if present
    raw_lines = decoded_text.splitlines()
    clean_lines = []
    in_data_section = False
    has_arff_header = False
    
    for line in raw_lines:
        line_str = line.strip()
        if not line_str:
            continue
            
        # Check ARFF header directives
        if line_str.lower().startswith("@relation") or line_str.lower().startswith("@attribute"):
            has_arff_header = True
            continue
        if line_str.lower().startswith("@data"):
            has_arff_header = True
            in_data_section = True
            continue
        if line_str.startswith("%") or line_str.startswith("#") or line_str.startswith("//"):
            # Skip comment line
            continue
            
        if has_arff_header:
            if in_data_section:
                clean_lines.append(line_str)
        else:
            clean_lines.append(line_str)

    if not clean_lines:
        raise ValueError("File appears to be empty or contains only non-tabular comments.")

    cleaned_payload = "\n".join(clean_lines)

    # If ARFF data without column names, check if 21 or 22 columns
    if has_arff_header:
        try:
            sample_row = clean_lines[0].split(",")
            if len(sample_row) in [21, 22]:
                cols = CANONICAL_FEATURES + (["defects"] if len(sample_row) == 22 else [])
                df = pd.read_csv(io.StringIO(cleaned_payload), header=None, names=cols)
                return df
        except Exception as e:
            logger.debug(f"ARFF header injection parse failed: {e}")

    # Standard / Auto-Delimiter CSV parsing
    try:
        # Try automatic delimiter sniffing with python engine
        df = pd.read_csv(
            io.StringIO(cleaned_payload),
            sep=None,
            engine="python",
            on_bad_lines="skip"
        )
        if not df.empty and len(df.columns) > 1:
            return df
    except Exception as e:
        logger.debug(f"Auto-delimiter python engine parse failed: {e}")

    # Fallback to explicit delimiters in priority
    for delimiter in [",", ";", "\t", "|", " "]:
        try:
            df = pd.read_csv(
                io.StringIO(cleaned_payload),
                sep=delimiter,
                on_bad_lines="skip"
            )
            if not df.empty and len(df.columns) > 1:
                return df
        except Exception:
            continue

    # Final attempt: standard read_csv
    df = pd.read_csv(io.StringIO(cleaned_payload), on_bad_lines="skip")
    return df


def prepare_pipeline_dataframe(raw_df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str], Dict[str, Any]]:
    """
    Intelligently maps and cleans raw DataFrame into the standard 21-feature NASA JM1 matrix.
    1. Normalizes and matches feature aliases.
    2. Extracts or synthesizes module names.
    3. Synthesizes missing Halstead/McCabe relations from available metrics.
    4. Imputes remaining missing features with empirical baseline medians.
    5. Returns (prepared_df, module_names, metadata_dict).
    """
    if raw_df is None or raw_df.empty:
        raise ValueError("Input dataset is empty or unreadable.")

    df = raw_df.copy()
    
    # Clean column headers
    df.columns = [str(c).strip().lstrip("\ufeff").strip('"').strip("'") for c in df.columns]
    
    # 1. Identify module name column
    module_names: List[str] = []
    module_col_found = None
    
    for col in df.columns:
        norm_col = _normalize_header_str(col)
        if any(norm_col == _normalize_header_str(alias) for alias in MODULE_NAME_ALIASES):
            module_col_found = col
            break
            
    if module_col_found:
        module_names = [str(val).strip() if pd.notna(val) and str(val).strip() else f"Module_{i+1:03d}" for i, val in enumerate(df[module_col_found])]
    else:
        module_names = [f"Module_{i+1:03d}" for i in range(len(df))]

    # 2. Match features using exact and alias dictionary
    mapped_columns: Dict[str, str] = {}  # canonical -> raw_column_name
    unmatched_raw_cols = list(df.columns)
    if module_col_found and module_col_found in unmatched_raw_cols:
        unmatched_raw_cols.remove(module_col_found)

    # First pass: Exact matches
    for canonical in CANONICAL_FEATURES:
        for raw_col in unmatched_raw_cols:
            if raw_col == canonical:
                mapped_columns[canonical] = raw_col
                unmatched_raw_cols.remove(raw_col)
                break

    # Second pass: Case-insensitive and alias matches
    for canonical in CANONICAL_FEATURES:
        if canonical in mapped_columns:
            continue
        aliases = COLUMN_ALIASES.get(canonical, [canonical])
        norm_aliases = [_normalize_header_str(a) for a in aliases]
        
        for raw_col in list(unmatched_raw_cols):
            norm_raw = _normalize_header_str(raw_col)
            if norm_raw in norm_aliases:
                mapped_columns[canonical] = raw_col
                unmatched_raw_cols.remove(raw_col)
                break

    # 3. Create canonical matrix with available and converted numeric values
    clean_matrix = pd.DataFrame(index=df.index)
    
    found_features: List[str] = []
    aliased_features: List[str] = []
    
    for canonical in CANONICAL_FEATURES:
        if canonical in mapped_columns:
            raw_col = mapped_columns[canonical]
            # Convert dirty string values (e.g. '?', 'NA', 'null') to numeric
            clean_series = pd.to_numeric(
                df[raw_col].astype(str).str.replace('?', 'NaN', regex=False),
                errors='coerce'
            )
            clean_matrix[canonical] = clean_series
            found_features.append(canonical)
            if raw_col != canonical:
                aliased_features.append(f"{raw_col} -> {canonical}")
        else:
            clean_matrix[canonical] = np.nan

    # 4. If arbitrary numeric columns exist and key metrics are missing, map leftover numeric columns
    numeric_unmatched = []
    for col in unmatched_raw_cols:
        norm_col = _normalize_header_str(col)
        # Skip known defect labels
        if any(norm_col == _normalize_header_str(d) for d in DEFECT_ALIASES):
            continue
        try:
            converted = pd.to_numeric(df[col].astype(str).str.replace('?', 'NaN', regex=False), errors='coerce')
            if not converted.isna().all():
                numeric_unmatched.append((col, converted))
        except Exception:
            pass

    for col_name, series in numeric_unmatched:
        # Find next unmapped canonical feature
        unmapped_target = next((c for c in CANONICAL_FEATURES if c not in found_features), None)
        if unmapped_target:
            clean_matrix[unmapped_target] = series
            found_features.append(unmapped_target)
            aliased_features.append(f"{col_name} (inferred) -> {unmapped_target}")

    # 5. Intelligent Halstead & McCabe Software Metric Synthesis
    synthesized_features: List[str] = []
    
    # Impute or synthesize individual rows / series
    # LOC related
    if "loc" in found_features and clean_matrix["loc"].notna().any():
        loc_s = clean_matrix["loc"].fillna(DEFAULT_FEATURE_MEDIANS["loc"])
        if clean_matrix["lOCode"].isna().all():
            clean_matrix["lOCode"] = (loc_s * 0.75).round()
            synthesized_features.append("lOCode (from loc)")
        if clean_matrix["lOComment"].isna().all():
            clean_matrix["lOComment"] = (loc_s * 0.12).round().clip(lower=0)
            synthesized_features.append("lOComment (from loc)")
        if clean_matrix["lOBlank"].isna().all():
            clean_matrix["lOBlank"] = (loc_s * 0.13).round().clip(lower=0)
            synthesized_features.append("lOBlank (from loc)")
        if clean_matrix["locCodeAndComment"].isna().all():
            clean_matrix["locCodeAndComment"] = 0.0
            synthesized_features.append("locCodeAndComment")

    # Cyclomatic Complexity related
    if "v(g)" in found_features and clean_matrix["v(g)"].notna().any():
        vg_s = clean_matrix["v(g)"].fillna(DEFAULT_FEATURE_MEDIANS["v(g)"])
        if clean_matrix["ev(g)"].isna().all():
            clean_matrix["ev(g)"].loc[clean_matrix["ev(g)"].isna()] = np.maximum(1.0, (vg_s * 0.45).round())
            synthesized_features.append("ev(g) (from v(g))")
        if clean_matrix["iv(g)"].isna().all():
            clean_matrix["iv(g)"].loc[clean_matrix["iv(g)"].isna()] = np.maximum(1.0, (vg_s * 0.55).round())
            synthesized_features.append("iv(g) (from v(g))")
        if clean_matrix["branchCount"].isna().all():
            clean_matrix["branchCount"] = np.maximum(1.0, (2.0 * vg_s - 1.0).round())
            synthesized_features.append("branchCount (from v(g))")

    # Halstead Operator/Operand Vocabulary synthesis
    if "uniq_Op" not in found_features or clean_matrix["uniq_Op"].isna().all():
        clean_matrix["uniq_Op"] = DEFAULT_FEATURE_MEDIANS["uniq_Op"]
    if "uniq_Opnd" not in found_features or clean_matrix["uniq_Opnd"].isna().all():
        clean_matrix["uniq_Opnd"] = DEFAULT_FEATURE_MEDIANS["uniq_Opnd"]
    if "total_Op" not in found_features or clean_matrix["total_Op"].isna().all():
        clean_matrix["total_Op"] = (clean_matrix["uniq_Op"] * 4.5).round()
    if "total_Opnd" not in found_features or clean_matrix["total_Opnd"].isna().all():
        clean_matrix["total_Opnd"] = (clean_matrix["uniq_Opnd"] * 3.5).round()

    # Halstead N & Volume equations
    if "n" not in found_features or clean_matrix["n"].isna().all():
        clean_matrix["n"] = clean_matrix["total_Op"] + clean_matrix["total_Opnd"]
        synthesized_features.append("n (N1+N2)")

    if "v" not in found_features or clean_matrix["v"].isna().all():
        vocab = np.maximum(2.0, clean_matrix["uniq_Op"] + clean_matrix["uniq_Opnd"])
        clean_matrix["v"] = (clean_matrix["n"] * np.log2(vocab)).round(2)
        synthesized_features.append("v (Halstead Volume)")

    if "d" not in found_features or clean_matrix["d"].isna().all():
        clean_matrix["d"] = ((clean_matrix["uniq_Op"] / 2.0) * (clean_matrix["total_Opnd"] / np.maximum(1.0, clean_matrix["uniq_Opnd"]))).round(2)
        synthesized_features.append("d (Halstead Difficulty)")

    if "l" not in found_features or clean_matrix["l"].isna().all():
        clean_matrix["l"] = (1.0 / np.maximum(0.01, clean_matrix["d"])).round(4)
    if "i" not in found_features or clean_matrix["i"].isna().all():
        clean_matrix["i"] = (clean_matrix["v"] / np.maximum(0.01, clean_matrix["d"])).round(2)
    if "e" not in found_features or clean_matrix["e"].isna().all():
        clean_matrix["e"] = (clean_matrix["v"] * clean_matrix["d"]).round(2)
        synthesized_features.append("e (Halstead Effort)")
    if "b" not in found_features or clean_matrix["b"].isna().all():
        clean_matrix["b"] = (clean_matrix["v"] / 3000.0).round(4)
        synthesized_features.append("b (Delivered Bugs)")
    if "t" not in found_features or clean_matrix["t"].isna().all():
        clean_matrix["t"] = (clean_matrix["e"] / 18.0).round(2)

    # 6. Fill any remaining NaN values in all 21 columns with empirical dataset medians
    missing_imputed = []
    for col in CANONICAL_FEATURES:
        if clean_matrix[col].isna().any():
            median_val = clean_matrix[col].median()
            if pd.isna(median_val):
                median_val = DEFAULT_FEATURE_MEDIANS.get(col, 0.0)
                missing_imputed.append(col)
            clean_matrix[col] = clean_matrix[col].fillna(median_val)

    # Final check: guarantee non-empty 21-column clean DataFrame
    clean_matrix = clean_matrix[CANONICAL_FEATURES].astype(float)
    
    metadata = {
        "total_rows": len(clean_matrix),
        "found_features": found_features,
        "aliased_features": aliased_features,
        "synthesized_features": synthesized_features,
        "imputed_features": missing_imputed,
        "matched_count": len(found_features),
        "module_names": module_names
    }
    
    return clean_matrix, module_names, metadata


def parse_dataset_file(contents: bytes, filename: str) -> Tuple[pd.DataFrame, List[str], Dict[str, Any]]:
    """
    High-level entry point: parses raw file bytes, applies normalization,
    and returns guaranteed clean dataframe with module names and telemetry metadata.
    """
    raw_df = parse_raw_bytes_to_df(contents, filename)
    clean_df, module_names, meta = prepare_pipeline_dataframe(raw_df)
    return clean_df, module_names, meta
