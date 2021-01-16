// generates four different gas pricings for each gas station

function priceGen(n) {

    var list = new Array(n);

    for (let i = 0; i < list.length; i += 1) {
        list[i] = new Array(4);
    }

    for (let i = 0; i < n; i += 1) {

        // four types of gas, octane 87, 89, 91, 94

        list[i][0] = (Math.random() * 30) + 90;
        list[i][1] = list[i][0] + 5;
        list[i][2] = list[i][1] + 5;
        list[i][3] = list[i][2] + 5;
    }

    return list;
}

const exampleList = priceGen(5);

for (let i = 0; i < exampleList.length; i += 1) {
    console.log(exampleList[i][0]);
    console.log(exampleList[i][1]);
    console.log(exampleList[i][2]);
    console.log(exampleList[i][3]);
}
