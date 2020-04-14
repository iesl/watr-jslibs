# Look for TODO/FIX etc.
numtodo=$(rg '(TODO|FIX|ACS)' workspaces | wc --lines)
echo "There are ~ $numtodo TODOs/FIX/ etc.. in the codebase"

