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
        let sheetid = this.getAttribute("data-sheet-name");
        if(sheetid == "" | sheetid == null | sheetid != undefined){
            sheetid = "";
            for(let i = 0; i<51; i++){
                let number = Math.floor(Math.random()*(shared.alphabet.length*2 + 10)) - 1;
                if(number >= 10){
                    number -= 10;
                    if(number > shared.alphabet.length){
                        sheetid += shared.alphabet[number - shared.alphabet.length].toUpperCase();
                    }else{
                        sheetid += shared.alphabet[number];
                    }
                }else{
                    sheetid += String(number);
                }
            }
            try {
                dataObject.onchange(new msgev("createSheet",sheetid));
                this.setAttribute("data-sheet-name", sheetid);
                this.setAttribute("id", "sheet_"+ sheetid);   
            } catch (error) {
                alert("Something very unlikely happened we will reload for you.");
                location.reload();
            }
        }else{
            dataObject.onchange(new msgev("createSheet",sheetid));
        }
        this.setAttribute("id", "sheet_"+sheetid);
        this.root_element = this;
        let link = document.createElement("link");
        link.setAttribute("rel","stylesheet");
        link.setAttribute("href", "css/spreadsheet.css");
        this.shadowRoot.append(this.generateSpreadsheet(50,50, sheetid), link);
    }

    static get observedAttributes(){return ["data-sheet-name", "class"];}

    attributeChangedCallback(name, oldValue, newValue) {
        if(name == "data-sheet-name"){
            if(oldValue){
                dataObject.onchange(new msgev("renameSheet",oldValue, {"new_name": newValue}));
                this.shadowRoot.firstChild.setAttribute("data-sheet-name", newValue);
            }
            //console.log(name, oldValue, newValue)
        }else if(name == "class"){
            if(oldValue =="" & newValue == "active"){
                this.style.visibility = "visible";
            }else if(oldValue =="active" & newValue == ""){
                this.style.visibility = "hidden";
            }
        }
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
        let sheetid = root.getAttribute("data-sheet-name")
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
        spreadsheet.setAttribute("data-sheet-name", sheetid)
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

class renderView{
    onchange = function(e){
        console.log("render received msg:");
        console.log(e);
        if(e.type == "createSheet"){
            //do nothing for now e.sheet could have only temporary sheetname now so we can't get it using its id
        }else{
            let curentSheet = document.getElementById("sheet_"+e.sheet);
            if(curentSheet != null){
                curentSheet.onchange(e); 
            }
        }
    }

    createSheet(name){
        function createSheetIcon(sheetName){
            let div = document.createElement("div");    
            let input = document.createElement("input");
            input.value = sheetName;
            input.setAttribute("data-sheet-name", sheetName);
            div.appendChild(input);
            div.setAttribute("id", "sheetIcon_" + sheetName);
            div.setAttribute("data-sheet-name", sheetName);
            div.addEventListener("click", function(e){
                Array.from(document.getElementById("spreadsheet-wrapper").getElementsByClassName("active"))[0].className = "";
                Array.from(document.getElementById("sheet-row").getElementsByClassName("active"))[0].className = "";
                if(e.target.nodeName == "DIV"){
                    e.target.className = "active";
                }else{
                    e.target.parentElement.className = "active";
                }
                document.getElementById("sheet_" +e.target.getAttribute("data-sheet-name")).className = "active";
            });
            return div;
        }
        let newSheet = new Sheetelem()
        newSheet.setAttribute("id", "sheet_" + name);
        newSheet.setAttribute("data-sheet-name", name);
        newSheet.className = "active"
        document.getElementById("spreadsheet-wrapper").appendChild(newSheet);
        let sheetIcon = createSheetIcon(name);
        sheetIcon.className = "active";
        document.getElementById("sheet-selector").appendChild(sheetIcon);
    }
}
const render = new renderView();

document.addEventListener("click", function(e){
    console.log(e);
    //SheetArray[0].testtosubmit(e);
});

document.getElementById("addsheet").addEventListener("click",function() {
    let sheetName = prompt("Input new sheet name.");
    if(sheetName.length > 50){
        alert("Name too long.");
    }else if(sheetName = ""){
        alert("Provide at least 1 character");
    }else{
        Array.from(document.getElementById("spreadsheet-wrapper").getElementsByClassName("active"))[0].className = "";
        Array.from(document.getElementById("sheet-row").getElementsByClassName("active"))[0].className = "";
        render.createSheet(sheetName);    
    }
});

customElements.define('sheet-custom', Sheetelem);

render.createSheet("newSheet");