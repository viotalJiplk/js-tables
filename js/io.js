// TODO:
// impement dependencies of cell
// implement styling

class Cell{
    constructor(content = undefined){
        this.content = content;
    }
    type = "";
    style = {};
    content = undefined;
}

class Sheet{
    data = {
        "row":{},
        "column":{},
        "table":{},
        "cells":[]
    }
    /**
     * gets content of cell
     * @param {String} location A1 notation of cells location
     * @param {String} reference A1 notation of location of cell which depends on this cell for interpreter mainly
     * @returns content of cell or null if cell does not exist
     */
    getCellcontent(location, reference=undefined){
        if(this.data.table[location] !== undefined){
            return this.data.cells[this.data.table[location].index].content;
        }else{
            return null;
        }
    }

    /**
     * sets content of cell
     * @param {String} location A1 notation of cells location
     * @param {*} new_content new content of cell 
     */
    setCellcontent(location, new_content){
        if(this.data.table[location] !== undefined){
            this.data.cells[this.data.table[location].index].content=new_content;
        }else{
            let cell = new Cell(new_content);
            this.data.table[location] = {
                "index": this.data.cells.push(cell) - 1
            };
        }
        //compute the output
        if(new_content[0] == "="){
            return function_or_pl(new_content.slice(1));
        }else{
            return new_content;
        }
    }

    /**
     * deletes cell
     * @param {String} location A1 notation of cells location
     */
    deleteCell(location){
        if(this.data.table[location] !== undefined){
            delete this.data.cells[this.data.table[location]];
            delete this.data.table[location]
        }
    }
};
const sheet1 = new Sheet();

