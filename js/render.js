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

/**
 * Generates an empty table element
 * @param {Number} width Table width...
 * @param {Number} height Table hight...
 * @returns {Element} Pregenerated table of defined size
 */
function generateTable(width, height) {
    var en_alphabeth = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]

    var table = document.createElement("table");

    for (var row_number = 0; row_number <= width; row_number++) {

        let row = table.insertRow(row_number);
        var th = document.createElement('th');

        if (row_number > 0) {
            th.innerHTML = row_number;
        }else{
            th.innerHTML = "*";
            th.style.zIndex = "9999";
        }

        row.appendChild(th);

        for (var column_number = 1; column_number <= height; column_number++) {
            
            console.log(column_number);

            // if it's the first row insert alphabetical header
            // TODO
            if (row_number == 0) {
                var th = document.createElement('th');
                th.innerHTML = column_number;
                row.appendChild(th);
            }else{
                var cell = row.insertCell(column_number);
            }
        }
    }
    console.log("end of cycle");
    return table;
}

/**
 * Appends empty table to 
 * @param {Element} element The element you wat to append the table to
 * @param {Number} width Table width...
 * @param {Number} height Table hight...
 * @returns {*} Appends pregenerated table of defined size to selected element.
 */
function appendTable(element,width,height){
    // attempt to clean input type?
    // element = Element(element);
    element.appendChild(generateTable(width,height));
}

appendTable(document.body,100,100);
/*
console.log(document.getElementsByName(body));
*/