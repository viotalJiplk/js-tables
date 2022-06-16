/*@licstart  The following is the entire license notice for the 
JavaScript code in this page.

Copyright (C) 2021 Vojtech Varecha
Copyright (C) 2021 Jan Krehlik

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

@licend  The above is the entire license notice
for the JavaScript code in this page.
*/

const en_alphabeth = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]

function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
}  

//stolen from https://github.com/alexfeseto/hexavigesimal/blob/master/hexavigesimal.js
Number.prototype.toBijectiveBase26 = (function () {
    return function toBijectiveBase26() {
      n = this + 1
      ret = "";
      while(parseInt(n)>0){
        --n;
        ret += String.fromCharCode("A".charCodeAt(0)+(n%26));
        n/=26;
      }
      return ret.split("").reverse().join("");
    };
}());

 /**
 * Generates an empty spreadsheet element
 * @param {Number} width Spreadsheet width...
 * @param {Number} height Spreadsheet hight...
 * @returns {HTMLDivElement} Pregenerated spreadsheet of defined size
 */
function generateSpreadsheet(width, height) {
    // TODO var en_alphabeth = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]

    var spreadsheet = document.createElement("div");
    spreadsheet.className = "spreadsheet";
    spreadsheet.id = "spreadsheet";

    for (var row_number = 0; row_number <= height; row_number++) {
        column_number = 0;

        var th = document.createElement('div');
        th.className = "spreadsheet-header";
        th.id = "th"+row_number;

        if (row_number > 0) {
            th.innerHTML = row_number;
        }else{
            th.innerHTML = "*";
            th.style.zIndex = "9999";
        }

        th.style.gridColumnStart=column_number+1;
        th.style.gridRowStart=row_number+1;
        spreadsheet.appendChild(th);

        for (var column_number = 1; column_number <= width; column_number++) {
            
            // if it's the first row insert alphabetical header
            // TODO
            if (row_number == 0) {
                var th = document.createElement('div');
                th.innerHTML = Number(column_number-1).toBijectiveBase26(); //-1 beccause first column does not count (there is just number of row - no data)
                th.className = "spreadsheet-header";
                th.id = "th"+column_number;

                th.style.gridColumnStart=column_number+1;
                th.style.gridRowStart=row_number+1;
                spreadsheet.appendChild(th);
            }else{
                var cell = document.createElement('div');
                cell.className = "spreadsheet-cell";
                cell.id = "cell"+column_number+"-"+row_number;
                // cell.innerHTML = "-"; //For testing

                cell.style.gridColumnStart=column_number+1;
                cell.style.gridRowStart=row_number+1;
                spreadsheet.appendChild(cell);
            }
        }
    }
    return spreadsheet;
}

/**
 * Appends empty spreadsheet to 
 * @param {Element} element The element you wat to append the spreadsheet to
 * @param {Number} width Spreadsheet width...
 * @param {Number} height Spreadsheet hight...
 * @returns {*} Appends pregenerated spreadsheet of defined size to selected element.
 */
function appendSpreadsheet(element,width,height){
    // attempt to clean input type?
    // element = Element(element);
    element.appendChild(generateSpreadsheet(width,height));
}

appendSpreadsheet(document.getElementById("spreadsheet-wrapper"),1000,1);
/*
console.log(document.getElementsByName(body));
*/