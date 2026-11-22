"""Grading harness for the Arena. Runs inside Pyodide (browser worker) and under CPython in tests.

run(code, tests) executes the learner's code, calls solve(*args) for each test and compares the result
with the expected value using a numeric tolerance. Hidden tests report only pass/fail.
"""
import contextlib
import io
import json
import math
import traceback

REL_TOL = 1e-6
ABS_TOL = 1e-6
MAX_TEXT = 2000


def _close(a, b):
    if isinstance(a, bool) or isinstance(b, bool):
        return a == b
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        return len(a) == len(b) and all(_close(x, y) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        return a.keys() == b.keys() and all(_close(a[k], b[k]) for k in a)
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return math.isclose(a, b, rel_tol=REL_TOL, abs_tol=ABS_TOL)
    return a == b


def _plain(value):
    """Convert numpy values and tuples to plain JSON-compatible Python."""
    if hasattr(value, "tolist"):
        return value.tolist()
    if isinstance(value, (list, tuple)):
        return [_plain(v) for v in value]
    if isinstance(value, dict):
        return {str(k): _plain(v) for k, v in value.items()}
    return value


def _clip(text):
    return text if len(text) <= MAX_TEXT else text[:MAX_TEXT] + "..."


def run(code, tests):
    results = []
    out = io.StringIO()
    namespace = {"__name__": "__learner__"}
    try:
        with contextlib.redirect_stdout(out):
            exec(compile(code, "<your code>", "exec"), namespace)
    except BaseException:
        error = _clip(traceback.format_exc(limit=3))
        return [{"ok": False, "visible": t["visible"], "error": error, "stdout": _clip(out.getvalue())} for t in tests]
    solve = namespace.get("solve")
    if not callable(solve):
        return [{"ok": False, "visible": t["visible"], "error": "Define a function named solve.", "stdout": ""} for t in tests]
    for test in tests:
        out = io.StringIO()
        entry = {"visible": test["visible"], "stdout": "", "error": None}
        try:
            with contextlib.redirect_stdout(out):
                got = _plain(solve(*json.loads(json.dumps(test["args"]))))
            entry["ok"] = _close(got, test["expected"])
            if test["visible"]:
                entry["got"] = _clip(json.dumps(got))
                entry["expected"] = _clip(json.dumps(test["expected"]))
        except BaseException:
            entry["ok"] = False
            entry["error"] = _clip(traceback.format_exc(limit=3)) if test["visible"] else "Raised an exception."
        entry["stdout"] = _clip(out.getvalue()) if test["visible"] else ""
        results.append(entry)
    return results


def run_json(code, tests_json):
    return json.dumps(run(code, json.loads(tests_json)))
