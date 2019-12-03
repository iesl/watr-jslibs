# Look for TODO/FIX etc.
numtodo=$(rg -i '\W(TODO|FIX|ACS)\W' | wc --lines)
echo "There are ~ $numtodo TODOs/FIX/ etc.. in the codebase"

