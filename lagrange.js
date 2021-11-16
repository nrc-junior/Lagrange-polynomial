function lagrange_method(pts, x = null){
    var somatorio  = ''
    var sum = 0;

    for (let l = 0; l < pts.length; l++) {
        const y = pts[l].y;
        
        var divider = ``
        var divisor = ``
        for (let i = 0; i < pts.length; i++) {
            var condition = i==l;
            if(condition) continue;
            
            divider += `(x-${pts[i].x})${ i < pts.length - ( i + 1 == l ? 2 : 1) ?'*':''}` 
            divisor += `(${pts[l].x}-${pts[i].x})${ i < pts.length - ( i + 1 == l ? 2 : 1) ?'*':''}` 
        }

        if(x != null){
            divider = divider.replaceAll('x',x).replace('--','+');
            divisor = divisor.replaceAll('--','+');

            somatorio += `<br>${y} * (${divider} /
                ${divisor}) ${l+1 >= pts.length ? '': '+'}`

            divider = eval(divider);
            divisor = eval(divisor)
            sum +=  (y * (divider/divisor));


        }else{
            somatorio += `<br>${y} * (${divider} /
                    ${divisor}) ${l+1 >= pts.length ? '': '+'}`
        }
    }

    if(x == null){
        document.getElementById('result').innerHTML = `Polinômio:<br>${somatorio}`
    }else{
        document.getElementById('result').innerHTML = `Interpolação de Lagrange:<br>${somatorio} = ${sum}`
    }

    return sum;
    
}