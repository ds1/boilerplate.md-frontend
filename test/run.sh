#!/usr/bin/env bash
# run.sh — Test all generated installer scripts in isolated temp directories
# Usage: cd boilerplate.md && bash test/run.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
GEN_DIR="$SCRIPT_DIR/generated"

PASS=0
FAIL=0
ERRORS=()

# ── Helpers ──────────────────────────────────────────────────────────

pass() { PASS=$((PASS + 1)); echo "  PASS: $1"; }
fail() { FAIL=$((FAIL + 1)); ERRORS+=("[$PRESET] $1"); echo "  FAIL: $1"; }

assert_file_exists() {
  if [[ -f "$1" ]]; then pass "$2 exists"; else fail "$2 missing: $1"; fi
}

assert_file_missing() {
  if [[ ! -f "$1" ]]; then pass "$2 does not exist"; else fail "$2 should not exist: $1"; fi
}

assert_dir_exists() {
  if [[ -d "$1" ]]; then pass "$2 exists"; else fail "$2 missing: $1"; fi
}

assert_dir_missing() {
  if [[ ! -d "$1" ]]; then pass "$2 does not exist"; else fail "$2 should not exist: $1"; fi
}

assert_file_contains() {
  if grep -q "$2" "$1" 2>/dev/null; then pass "$3"; else fail "$3 (pattern '$2' not found in $1)"; fi
}

assert_valid_json() {
  if node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))" -- "$1" 2>/dev/null; then
    pass "$2 is valid JSON"
  else
    fail "$2 is invalid JSON"
  fi
}

# ── Step 1: Generate scripts ────────────────────────────────────────

echo "=== Generating scripts from all presets ==="
echo ""
node "$SCRIPT_DIR/generate-scripts.js"
echo ""

# ── Step 2: Test each preset's bash script ──────────────────────────

PRESETS=("full" "recommended" "minimal" "commandsOnly" "reset")

for PRESET in "${PRESETS[@]}"; do
  echo "─────────────────────────────────────────────"
  echo "Testing bash: $PRESET"
  echo "─────────────────────────────────────────────"

  # Read manifest (bash-sourceable .env file)
  source "$GEN_DIR/$PRESET.env"

  # Create isolated temp home
  TEMP_HOME=$(mktemp -d)
  CLAUDE_DIR="$TEMP_HOME/.claude"

  if [[ "$IS_RESET" == "true" ]]; then
    # For reset test, pre-create files so the reset script has something to remove
    mkdir -p "$CLAUDE_DIR/commands"
    echo "dummy" > "$CLAUDE_DIR/CLAUDE.md"
    echo "{}" > "$CLAUDE_DIR/settings.json"
    echo "dummy" > "$CLAUDE_DIR/commands/test.md"
  fi

  # Run the script with redirected HOME
  SCRIPT="$GEN_DIR/$PRESET.sh"
  if HOME="$TEMP_HOME" bash "$SCRIPT" > /dev/null 2>&1; then
    pass "script executed without errors"
  else
    fail "script exited with non-zero status"
  fi

  if [[ "$IS_RESET" == "true" ]]; then
    # Reset: verify files were removed
    assert_file_missing "$CLAUDE_DIR/CLAUDE.md" "CLAUDE.md"
    assert_file_missing "$CLAUDE_DIR/settings.json" "settings.json"
    assert_dir_missing "$CLAUDE_DIR/commands" "commands/"
  else
    # Install: verify files were created
    assert_dir_exists "$CLAUDE_DIR" ".claude directory"

    # CLAUDE.md
    if [[ "$EXPECT_CLAUDE_MD" == "true" ]]; then
      assert_file_exists "$CLAUDE_DIR/CLAUDE.md" "CLAUDE.md"
      assert_file_contains "$CLAUDE_DIR/CLAUDE.md" "Global Claude Code Instructions" "CLAUDE.md has header"

      # Check that it has the right number of ## sections (minus the # header)
      ACTUAL_SECTIONS=$(grep -c "^## " "$CLAUDE_DIR/CLAUDE.md" || true)
      if [[ "$ACTUAL_SECTIONS" -eq "$SECTION_COUNT" ]]; then
        pass "CLAUDE.md has $SECTION_COUNT sections"
      else
        fail "CLAUDE.md: expected $SECTION_COUNT sections, got $ACTUAL_SECTIONS"
      fi
    else
      assert_file_missing "$CLAUDE_DIR/CLAUDE.md" "CLAUDE.md (not expected)"
    fi

    # settings.json
    if [[ "$EXPECT_SETTINGS" == "true" ]]; then
      assert_file_exists "$CLAUDE_DIR/settings.json" "settings.json"
      assert_valid_json "$CLAUDE_DIR/settings.json" "settings.json"
    else
      assert_file_missing "$CLAUDE_DIR/settings.json" "settings.json (not expected)"
    fi

    # Commands
    if [[ "$CMD_COUNT" -gt 0 ]]; then
      assert_dir_exists "$CLAUDE_DIR/commands" "commands directory"

      IFS=',' read -ra CMDS <<< "$CMD_FILES"
      for CMD_FILE in "${CMDS[@]}"; do
        if [[ -n "$CMD_FILE" ]]; then
          assert_file_exists "$CLAUDE_DIR/commands/$CMD_FILE" "command: $CMD_FILE"
          # Verify command files are non-empty
          if [[ -s "$CLAUDE_DIR/commands/$CMD_FILE" ]]; then
            pass "$CMD_FILE is non-empty"
          else
            fail "$CMD_FILE is empty"
          fi
        fi
      done

      ACTUAL_CMD_COUNT=$(ls -1 "$CLAUDE_DIR/commands/" 2>/dev/null | wc -l | tr -d ' ')
      if [[ "$ACTUAL_CMD_COUNT" -eq "$CMD_COUNT" ]]; then
        pass "$CMD_COUNT command files created"
      else
        fail "expected $CMD_COUNT command files, got $ACTUAL_CMD_COUNT"
      fi
    else
      assert_dir_missing "$CLAUDE_DIR/commands" "commands/ (not expected)"
    fi
  fi

  # Cleanup
  rm -rf "$TEMP_HOME"
  echo ""
done

# ── Step 3: Test each preset's zip file ─────────────────────────────

if command -v unzip &>/dev/null; then
  echo "─────────────────────────────────────────────"
  echo "Zip tests"
  echo "─────────────────────────────────────────────"
  echo ""

  # reset has no zip (no files to include)
  ZIP_PRESETS=("full" "recommended" "minimal" "commandsOnly")

  for PRESET in "${ZIP_PRESETS[@]}"; do
    echo "  --- Zip: $PRESET ---"

    source "$GEN_DIR/$PRESET.env"

    TEMP_ZIP=$(mktemp -d)
    CLAUDE_DIR="$TEMP_ZIP/.claude"

    # Extract the zip
    if unzip -q "$GEN_DIR/$PRESET.zip" -d "$TEMP_ZIP" 2>/dev/null; then
      pass "zip extracted without errors"
    else
      fail "zip extraction failed"
      rm -rf "$TEMP_ZIP"
      continue
    fi

    assert_dir_exists "$CLAUDE_DIR" "zip .claude directory"

    # CLAUDE.md
    if [[ "$EXPECT_CLAUDE_MD" == "true" ]]; then
      assert_file_exists "$CLAUDE_DIR/CLAUDE.md" "zip CLAUDE.md"
      assert_file_contains "$CLAUDE_DIR/CLAUDE.md" "Global Claude Code Instructions" "zip CLAUDE.md has header"

      ACTUAL_SECTIONS=$(grep -c "^## " "$CLAUDE_DIR/CLAUDE.md" || true)
      if [[ "$ACTUAL_SECTIONS" -eq "$SECTION_COUNT" ]]; then
        pass "zip CLAUDE.md has $SECTION_COUNT sections"
      else
        fail "zip CLAUDE.md: expected $SECTION_COUNT sections, got $ACTUAL_SECTIONS"
      fi
    else
      assert_file_missing "$CLAUDE_DIR/CLAUDE.md" "zip CLAUDE.md (not expected)"
    fi

    # settings.json
    if [[ "$EXPECT_SETTINGS" == "true" ]]; then
      assert_file_exists "$CLAUDE_DIR/settings.json" "zip settings.json"
      assert_valid_json "$CLAUDE_DIR/settings.json" "zip settings.json"
    else
      assert_file_missing "$CLAUDE_DIR/settings.json" "zip settings.json (not expected)"
    fi

    # Commands
    if [[ "$CMD_COUNT" -gt 0 ]]; then
      assert_dir_exists "$CLAUDE_DIR/commands" "zip commands directory"

      IFS=',' read -ra CMDS <<< "$CMD_FILES"
      for CMD_FILE in "${CMDS[@]}"; do
        if [[ -n "$CMD_FILE" ]]; then
          assert_file_exists "$CLAUDE_DIR/commands/$CMD_FILE" "zip command: $CMD_FILE"
          if [[ -s "$CLAUDE_DIR/commands/$CMD_FILE" ]]; then
            pass "zip $CMD_FILE is non-empty"
          else
            fail "zip $CMD_FILE is empty"
          fi
        fi
      done

      ACTUAL_CMD_COUNT=$(ls -1 "$CLAUDE_DIR/commands/" 2>/dev/null | wc -l | tr -d ' ')
      if [[ "$ACTUAL_CMD_COUNT" -eq "$CMD_COUNT" ]]; then
        pass "zip $CMD_COUNT command files created"
      else
        fail "zip expected $CMD_COUNT command files, got $ACTUAL_CMD_COUNT"
      fi
    else
      assert_dir_missing "$CLAUDE_DIR/commands" "zip commands/ (not expected)"
    fi

    rm -rf "$TEMP_ZIP"
  done

  # Cross-check: zip content matches bash output
  echo ""
  echo "  --- Bash vs Zip content match ---"
  PRESET="bash-vs-zip"
  TEMP_BASH=$(mktemp -d)
  TEMP_ZIP=$(mktemp -d)
  HOME="$TEMP_BASH" bash "$GEN_DIR/full.sh" > /dev/null 2>&1
  unzip -q "$GEN_DIR/full.zip" -d "$TEMP_ZIP" 2>/dev/null

  # Normalize trailing newlines before comparing (bash heredoc adds trailing \n, zip stores as-is)
  # printf '%s' "$(cat file)" strips trailing newlines via command substitution
  BASH_MD5=$(printf '%s' "$(cat "$TEMP_BASH/.claude/CLAUDE.md")" | md5sum | cut -d' ' -f1)
  ZIP_MD5=$(printf '%s' "$(cat "$TEMP_ZIP/.claude/CLAUDE.md")" | md5sum | cut -d' ' -f1)
  if [[ "$BASH_MD5" == "$ZIP_MD5" ]]; then
    pass "CLAUDE.md content matches between bash and zip"
  else
    fail "CLAUDE.md differs between bash and zip"
  fi

  BASH_SETTINGS=$(printf '%s' "$(cat "$TEMP_BASH/.claude/settings.json")" | md5sum | cut -d' ' -f1)
  ZIP_SETTINGS=$(printf '%s' "$(cat "$TEMP_ZIP/.claude/settings.json")" | md5sum | cut -d' ' -f1)
  if [[ "$BASH_SETTINGS" == "$ZIP_SETTINGS" ]]; then
    pass "settings.json content matches between bash and zip"
  else
    fail "settings.json differs between bash and zip"
  fi

  BASH_CMD=$(printf '%s' "$(cat "$TEMP_BASH/.claude/commands/backlog.md")" | md5sum | cut -d' ' -f1)
  ZIP_CMD=$(printf '%s' "$(cat "$TEMP_ZIP/.claude/commands/backlog.md")" | md5sum | cut -d' ' -f1)
  if [[ "$BASH_CMD" == "$ZIP_CMD" ]]; then
    pass "command file content matches between bash and zip"
  else
    fail "command file backlog.md differs between bash and zip"
  fi

  rm -rf "$TEMP_BASH" "$TEMP_ZIP"
  echo ""
else
  echo "─────────────────────────────────────────────"
  echo "Skipping zip tests (unzip not found)"
  echo "─────────────────────────────────────────────"
  echo ""
fi

# ── Step 4: Cross-preset content validation (bash) ──────────────────

echo "─────────────────────────────────────────────"
echo "Cross-preset validations"
echo "─────────────────────────────────────────────"
PRESET="cross-check"

# Full should be a superset of recommended
TEMP_FULL=$(mktemp -d)
TEMP_REC=$(mktemp -d)
HOME="$TEMP_FULL" bash "$GEN_DIR/full.sh" > /dev/null 2>&1
HOME="$TEMP_REC" bash "$GEN_DIR/recommended.sh" > /dev/null 2>&1

FULL_SECTIONS=$(grep -c "^## " "$TEMP_FULL/.claude/CLAUDE.md" || true)
REC_SECTIONS=$(grep -c "^## " "$TEMP_REC/.claude/CLAUDE.md" || true)
if [[ "$FULL_SECTIONS" -ge "$REC_SECTIONS" ]]; then
  pass "full ($FULL_SECTIONS sections) >= recommended ($REC_SECTIONS sections)"
else
  fail "full ($FULL_SECTIONS) should have more sections than recommended ($REC_SECTIONS)"
fi

FULL_CMDS=$(ls -1 "$TEMP_FULL/.claude/commands/" | wc -l | tr -d ' ')
REC_CMDS=$(ls -1 "$TEMP_REC/.claude/commands/" | wc -l | tr -d ' ')
if [[ "$FULL_CMDS" -ge "$REC_CMDS" ]]; then
  pass "full ($FULL_CMDS commands) >= recommended ($REC_CMDS commands)"
else
  fail "full ($FULL_CMDS) should have more commands than recommended ($REC_CMDS)"
fi

rm -rf "$TEMP_FULL" "$TEMP_REC"

# commandsOnly should have no CLAUDE.md or settings.json
TEMP_CO=$(mktemp -d)
HOME="$TEMP_CO" bash "$GEN_DIR/commandsOnly.sh" > /dev/null 2>&1
assert_file_missing "$TEMP_CO/.claude/CLAUDE.md" "commandsOnly: no CLAUDE.md"
assert_file_missing "$TEMP_CO/.claude/settings.json" "commandsOnly: no settings.json"
assert_dir_exists "$TEMP_CO/.claude/commands" "commandsOnly: has commands/"
rm -rf "$TEMP_CO"

# Idempotency: running the same script twice should not break anything
echo ""
echo "─────────────────────────────────────────────"
echo "Idempotency test (running recommended twice)"
echo "─────────────────────────────────────────────"
PRESET="idempotency"

TEMP_IDEM=$(mktemp -d)
HOME="$TEMP_IDEM" bash "$GEN_DIR/recommended.sh" > /dev/null 2>&1
# Capture file contents after first run
MD5_1=$(md5sum "$TEMP_IDEM/.claude/CLAUDE.md" 2>/dev/null | cut -d' ' -f1)
HOME="$TEMP_IDEM" bash "$GEN_DIR/recommended.sh" > /dev/null 2>&1
MD5_2=$(md5sum "$TEMP_IDEM/.claude/CLAUDE.md" 2>/dev/null | cut -d' ' -f1)

if [[ "$MD5_1" == "$MD5_2" ]]; then
  pass "CLAUDE.md identical after second run"
else
  fail "CLAUDE.md changed after second run (not idempotent)"
fi
rm -rf "$TEMP_IDEM"

# ── Step 5: PowerShell tests ─────────────────────────────────────────

if command -v powershell.exe &>/dev/null; then
  echo "─────────────────────────────────────────────"
  echo "PowerShell tests"
  echo "─────────────────────────────────────────────"
  echo ""

  for PRESET in "${PRESETS[@]}"; do
    echo "  --- PowerShell: $PRESET ---"

    source "$GEN_DIR/$PRESET.env"

    # Create isolated temp home (Windows-compatible path)
    TEMP_HOME=$(mktemp -d)
    WIN_TEMP_HOME=$(cygpath -w "$TEMP_HOME")
    CLAUDE_DIR="$TEMP_HOME/.claude"
    WIN_SCRIPT=$(cygpath -w "$GEN_DIR/$PRESET.ps1")

    if [[ "$IS_RESET" == "true" ]]; then
      mkdir -p "$CLAUDE_DIR/commands"
      echo "dummy" > "$CLAUDE_DIR/CLAUDE.md"
      echo "{}" > "$CLAUDE_DIR/settings.json"
      echo "dummy" > "$CLAUDE_DIR/commands/test.md"
    fi

    # Run the PowerShell script with overridden USERPROFILE (env var inherited by child process)
    if USERPROFILE="$WIN_TEMP_HOME" powershell.exe -ExecutionPolicy Bypass -NoProfile -File "$WIN_SCRIPT" > /dev/null 2>&1; then
      pass "ps1 executed without errors"
    else
      fail "ps1 exited with non-zero status"
    fi

    if [[ "$IS_RESET" == "true" ]]; then
      assert_file_missing "$CLAUDE_DIR/CLAUDE.md" "ps CLAUDE.md"
      assert_file_missing "$CLAUDE_DIR/settings.json" "ps settings.json"
      assert_dir_missing "$CLAUDE_DIR/commands" "ps commands/"
    else
      assert_dir_exists "$CLAUDE_DIR" "ps .claude directory"

      if [[ "$EXPECT_CLAUDE_MD" == "true" ]]; then
        assert_file_exists "$CLAUDE_DIR/CLAUDE.md" "ps CLAUDE.md"
        assert_file_contains "$CLAUDE_DIR/CLAUDE.md" "Global Claude Code Instructions" "ps CLAUDE.md has header"

        ACTUAL_SECTIONS=$(grep -c "^## " "$CLAUDE_DIR/CLAUDE.md" || true)
        if [[ "$ACTUAL_SECTIONS" -eq "$SECTION_COUNT" ]]; then
          pass "ps CLAUDE.md has $SECTION_COUNT sections"
        else
          fail "ps CLAUDE.md: expected $SECTION_COUNT sections, got $ACTUAL_SECTIONS"
        fi
      else
        assert_file_missing "$CLAUDE_DIR/CLAUDE.md" "ps CLAUDE.md (not expected)"
      fi

      if [[ "$EXPECT_SETTINGS" == "true" ]]; then
        assert_file_exists "$CLAUDE_DIR/settings.json" "ps settings.json"
        assert_valid_json "$CLAUDE_DIR/settings.json" "ps settings.json"
      else
        assert_file_missing "$CLAUDE_DIR/settings.json" "ps settings.json (not expected)"
      fi

      if [[ "$CMD_COUNT" -gt 0 ]]; then
        assert_dir_exists "$CLAUDE_DIR/commands" "ps commands directory"

        IFS=',' read -ra CMDS <<< "$CMD_FILES"
        for CMD_FILE in "${CMDS[@]}"; do
          if [[ -n "$CMD_FILE" ]]; then
            assert_file_exists "$CLAUDE_DIR/commands/$CMD_FILE" "ps command: $CMD_FILE"
            if [[ -s "$CLAUDE_DIR/commands/$CMD_FILE" ]]; then
              pass "ps $CMD_FILE is non-empty"
            else
              fail "ps $CMD_FILE is empty"
            fi
          fi
        done

        ACTUAL_CMD_COUNT=$(ls -1 "$CLAUDE_DIR/commands/" 2>/dev/null | wc -l | tr -d ' ')
        if [[ "$ACTUAL_CMD_COUNT" -eq "$CMD_COUNT" ]]; then
          pass "ps $CMD_COUNT command files created"
        else
          fail "ps expected $CMD_COUNT command files, got $ACTUAL_CMD_COUNT"
        fi
      else
        assert_dir_missing "$CLAUDE_DIR/commands" "ps commands/ (not expected)"
      fi
    fi

    rm -rf "$TEMP_HOME"
  done

  # PowerShell idempotency
  echo ""
  echo "  --- PowerShell: idempotency ---"
  PRESET="ps-idempotency"
  TEMP_IDEM=$(mktemp -d)
  WIN_IDEM=$(cygpath -w "$TEMP_IDEM")
  WIN_REC=$(cygpath -w "$GEN_DIR/recommended.ps1")
  USERPROFILE="$WIN_IDEM" powershell.exe -ExecutionPolicy Bypass -NoProfile -File "$WIN_REC" > /dev/null 2>&1
  MD5_1=$(md5sum "$TEMP_IDEM/.claude/CLAUDE.md" 2>/dev/null | cut -d' ' -f1)
  USERPROFILE="$WIN_IDEM" powershell.exe -ExecutionPolicy Bypass -NoProfile -File "$WIN_REC" > /dev/null 2>&1
  MD5_2=$(md5sum "$TEMP_IDEM/.claude/CLAUDE.md" 2>/dev/null | cut -d' ' -f1)
  if [[ "$MD5_1" == "$MD5_2" ]]; then
    pass "ps CLAUDE.md identical after second run"
  else
    fail "ps CLAUDE.md changed after second run"
  fi
  rm -rf "$TEMP_IDEM"

  # Cross-check: bash and PowerShell produce same CLAUDE.md content
  echo ""
  echo "  --- Bash vs PowerShell content match ---"
  PRESET="bash-vs-ps"
  TEMP_BASH=$(mktemp -d)
  TEMP_PS=$(mktemp -d)
  WIN_PS_HOME=$(cygpath -w "$TEMP_PS")
  WIN_FULL=$(cygpath -w "$GEN_DIR/full.ps1")
  HOME="$TEMP_BASH" bash "$GEN_DIR/full.sh" > /dev/null 2>&1
  USERPROFILE="$WIN_PS_HOME" powershell.exe -ExecutionPolicy Bypass -NoProfile -File "$WIN_FULL" > /dev/null 2>&1

  # Normalize line endings (PowerShell writes CRLF, bash writes LF) before comparing
  BASH_MD5=$(tr -d '\r' < "$TEMP_BASH/.claude/CLAUDE.md" | md5sum | cut -d' ' -f1)
  PS_MD5=$(tr -d '\r' < "$TEMP_PS/.claude/CLAUDE.md" | md5sum | cut -d' ' -f1)
  if [[ "$BASH_MD5" == "$PS_MD5" ]]; then
    pass "CLAUDE.md content matches between bash and PowerShell"
  else
    fail "CLAUDE.md differs between bash and PowerShell"
  fi

  BASH_SETTINGS=$(tr -d '\r' < "$TEMP_BASH/.claude/settings.json" | md5sum | cut -d' ' -f1)
  PS_SETTINGS=$(tr -d '\r' < "$TEMP_PS/.claude/settings.json" | md5sum | cut -d' ' -f1)
  if [[ "$BASH_SETTINGS" == "$PS_SETTINGS" ]]; then
    pass "settings.json content matches between bash and PowerShell"
  else
    fail "settings.json differs between bash and PowerShell"
  fi

  # Compare a sample command file
  BASH_CMD=$(tr -d '\r' < "$TEMP_BASH/.claude/commands/backlog.md" | md5sum | cut -d' ' -f1)
  PS_CMD_HASH=$(tr -d '\r' < "$TEMP_PS/.claude/commands/backlog.md" | md5sum | cut -d' ' -f1)
  if [[ "$BASH_CMD" == "$PS_CMD_HASH" ]]; then
    pass "command file content matches between bash and PowerShell"
  else
    fail "command file backlog.md differs between bash and PowerShell"
  fi

  rm -rf "$TEMP_BASH" "$TEMP_PS"
  echo ""
else
  echo "─────────────────────────────────────────────"
  echo "Skipping PowerShell tests (powershell.exe not found)"
  echo "─────────────────────────────────────────────"
  echo ""
fi

# ── Step 6: Heredoc safety — ensure no content breaks the bash heredoc ─

echo ""
echo "─────────────────────────────────────────────"
echo "Heredoc safety (check for EOF in content)"
echo "─────────────────────────────────────────────"
PRESET="heredoc-safety"

for P in full recommended minimal; do
  SCRIPT_CONTENT=$(cat "$GEN_DIR/$P.sh")

  # Extract heredoc delimiter names from lines like: cat << 'DELIM_NAME' > ...
  CLOSE_PATTERNS=$(echo "$SCRIPT_CONTENT" | grep "^cat << '" | sed "s/^cat << '//;s/'.*//" || true)

  ALL_GOOD=true
  while IFS= read -r DELIM; do
    if [[ -z "$DELIM" ]]; then continue; fi
    # The delimiter should appear exactly once as a standalone closing line
    DELIM_COUNT=$(echo "$SCRIPT_CONTENT" | grep -c "^${DELIM}$" || true)
    if [[ "$DELIM_COUNT" -eq 1 ]]; then
      pass "$P: heredoc delimiter $DELIM appears exactly once as closing"
    else
      fail "$P: heredoc delimiter $DELIM appears $DELIM_COUNT times (expected 1 closing)"
      ALL_GOOD=false
    fi
  done <<< "$CLOSE_PATTERNS"

  if [[ "$ALL_GOOD" == "true" && -n "$CLOSE_PATTERNS" ]]; then
    pass "$P: all heredocs properly delimited"
  fi
done

# ── Summary ─────────────────────────────────────────────────────────

echo ""
echo "═══════════════════════════════════════════════"
echo "Results: $PASS passed, $FAIL failed"
echo "═══════════════════════════════════════════════"

if [[ $FAIL -gt 0 ]]; then
  echo ""
  echo "Failures:"
  for ERR in "${ERRORS[@]}"; do
    echo "  - $ERR"
  done
  exit 1
fi

echo "All tests passed!"
