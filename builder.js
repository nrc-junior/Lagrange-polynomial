document.getElementById("range").addEventListener('change', build);
//document.getElementById("pontos_controller").addEventListener('change', evaluate);
var field_vectors = [];
var vectors = [];

function evaluateLagrange(){
    const add = parseFloat(document.getElementById('fifj').value);

    var y = lagrange_method(vectors, add);
    var idx = 0
    if(add >= vectors[vectors.length-1].x){
        vectors.push({x:add, y: y, cor:'#00ff00'});
        idx = vectors.length-1;
    }else{
        for (let i = 1; i < vectors.length; i++) {
            idx = i-1
            if(add <= vectors[i-1].x){
                vectors.unshift({x:add, y: y, cor:'#00ff00'})
                break;
            }else if(add <= vectors[i].x){
                idx = i;
                vectors.splice(i, 0, {x:add, y: y, cor:'#00ff00'} )
                break;
            }
        }
    }

    GraphPlot(vectors)
    vectors.splice(idx,1)
    return false;
}    

function setPoints(){
    vectors = [];
    field_vectors.forEach(v => { vectors.push({x:document.getElementById(v.x).value, y: document.getElementById(v.y).value})});
    vectors.forEach(v => {v.x = parseFloat(v.x); v.y = parseFloat(v.y); v['cor'] = '#ff0000';});
    GraphPlot(vectors);
   
    document.getElementById('input').innerHTML = `<h4 style="width: 50%; display: inline-block;" id='result'>resultado:</h4>       
    <h4 style="width: 40%; display: inline-block" id='input'>
        <form onsubmit="evaluateLagrange(); return false">
            Informe x:
            <input placeholder="LiFj(x)" value="" id="fifj" style="width: 25%;">
            <button type="submit">Interpolar</button>
        </form>
    </h4> `;
    lagrange_method(vectors)
    return false;
}


function build(){
    if(this.value == undefined){
        this.value = 2;
    }

    field_vectors = [];
    var elements = ''

    for(let i = 0; i < this.value; i++ ){
        field_vectors.push({x: `a${i}x`, y:`a${i}y`});
        var x = undefined;
        var y = undefined;

        if(document.getElementById(`a${i}x`) != null){
            x = document.getElementById(`a${i}x`).value;
        }
        if(document.getElementById(`a${i}y`) != null){
            y = document.getElementById(`a${i}y`).value;
        }
        
        elements += `
        <div style="width: 100%;">
        <span style="width: 10%; display: inline-block; text-align: center;"> a${i} </span>
        <span style=" display: inline-block; height: 100%; width: 5%;"></span>
        <span style=" width: 30%; display: inline-block;"> 
        <input style= "width:100%; height: 100%;" id="a${i}x" value="${x == undefined ? 0 : x}" placeholder="x"> 
        </span>
        <span style=" display: inline-block; height: 100%; width: 10%;"></span>
        <span style=" width: 30%; display: inline-block;"> 
        <input style= "width:100%; height: 100%;" id="a${i}y" value="${y == undefined ? 0 : y}" placeholder="f(x)"> 
        </span>
        </div>`;
    
        GraphPlot(vectors);
    }

    var pontos_parent = document.getElementById("pontos");
    pontos_parent.innerHTML = elements 

}