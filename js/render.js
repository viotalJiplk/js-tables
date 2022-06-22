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

class Sheetelem extends HTMLElement{
    constructor(){
        super();
        this.attachShadow({mode: 'open'});
        let sheetid = this.getAttribute("data-sheet-id");
        this.setAttribute("id", "sheet_"+sheetid);
        dataObject.onchange(new msgev("createSheet",sheetid));

        this.root_element = this;
        let link = document.createElement("link");
        link.setAttribute("rel","stylesheet");
        link.setAttribute("href", "css/spreadsheet.css");
        this.shadowRoot.append(this.generateSpreadsheet(50,50, sheetid), link);
    }

    onchange = function(e){
        if(e.type == "contentArrayChange"){
            let column = Number().fromBijectiveBase26(e.data.location.match(shared.regex.A1column));
            let row = Number(e.data.location.match(shared.regex.A1row));
            let i = 0;
            while(i<e.data.changed.length){
                let j=0;
                while(j<e.data.changed[i].length){
                        try{
                            this.shadowRoot.getElementById(Number(column+i).toBijectiveBase26()+String(row +j)).firstElementChild.value = e.data.changed[i][j];
                        }catch(e){
                            throw new Error("The cell " + Number(column+i).toBijectiveBase26()+String(row +j) + " does not exist. Is the table big enought?");
                        }
                        j++;
                }
                i++;
            }
        }else if(e.type=="createSheet"){

        }else if(e.type=="deleteSheet"){
            
        }else if(e.type=="renameSheet"){
            
        }else if(e.type = "Error"){
            alert(e.data.errormsg);
        }
    }

    /**
     * tests if you clicked out of input tag and if you had processes the change
     * @param {Event} event 
     */
    eventHandeler(event){
        function getroot(elem){
            while(elem.parentElement != null){
                elem = elem.parentElement
            }
            return elem;
        }
        /**
         * function to interface with io js to compute the output
         * @param {Array} cellcontent cell content
         */
        async function submit(cellcontent, sheetid, location){
            dataObject.onchange(new msgev("contentArrayChange",  sheetid,{"location":location, "changed": cellcontent}));
        }

        let root = getroot(event.target);
        let sheetid = root.getAttribute("data-sheet-id")
        let active = Array.from(root.getElementsByClassName("active"))[0];
        if(active !== undefined){
            if(event.target !== active){
                if(active.nodeName =="INPUT"){
                    submit([[active.value]], sheetid, active.parentElement.id);
                }
                if(event.target.nodeName == "INPUT"){
                    dataObject.onchange(new msgev("contentRangeDiscovery", sheetid, {"locationrange":event.target.parentElement.id}));
                }
            }
            active.className ="";
        }
        event.target.className = "active"; 
    }
    /**
     * Generates an empty spreadsheet element
     * @param {Number} width Spreadsheet width...
     * @param {Number} height Spreadsheet hight...
     * @returns {HTMLDivElement} Pregenerated spreadsheet of defined size
     */
     generateSpreadsheet(width, height, sheetid) {

        var spreadsheet = document.createElement("div");
        spreadsheet.className = "spreadsheet";
        spreadsheet.setAttribute("data-sheet-id", sheetid)
        spreadsheet.id = "spreadsheet";

        for (var row_number = 0; row_number <= height; row_number++) {
            let column_number = 0;

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

            for (let column_number = 1; column_number <= width; column_number++) {
                let column = Number(column_number).toBijectiveBase26()
                if (row_number == 0) {
                    let th = document.createElement('div');
                    th.innerHTML = column;
                    th.className = "spreadsheet-header";
                    th.id = "th"+column;

                    th.style.gridColumnStart=column_number+1;
                    th.style.gridRowStart=row_number+1;
                    spreadsheet.appendChild(th);
                }else{
                    let input = document.createElement('input');
                    input.addEventListener("click", this.eventHandeler);
                    
                    let cell = document.createElement('div');
                    cell.className = "spreadsheet-cell " +column + " "+ row_number;
                    cell.id = column+row_number;
                    cell.appendChild(input);
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
    appendSpreadsheet(width,height){
        // attempt to clean input type?
        // element = Element(element);
        this.root_element.appendChild(this.generateSpreadsheet(width,height));
    }
}

const render = {};
render.onchange = function(e){
    console.log("render received msg:");
    console.log(e);
    document.getElementById("sheet_"+e.sheet).onchange(e);;    
}

document.addEventListener("click", function(e){
    console.log(e);
    //SheetArray[0].testtosubmit(e);
});

customElements.define('sheet-custom', Sheetelem);

/*
console.log(document.getElementsByName(body));
*/