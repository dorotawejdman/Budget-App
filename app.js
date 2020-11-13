//BUDGET CONTROLLER
var budgetController = (function(){
    var Expense = function(id,description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome>0){
            this.percentage = Math.round(this.value / totalIncome *100);
        } else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }
    
    var Income = function(id,description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach( element => {
            sum += element.value;
        });
        data.totals[type] = sum;
    };

    return{
        addItem: function(type, desc, val){
            var newItem, id;

            //Create new id
            if(data.allItems[type].length > 0) id = data.allItems[type][data.allItems[type].length-1].id + 1;
            else id=0;

            //Create new item based on 'exp' or 'inc'
            if(type === 'exp'){
                newItem = new Expense(id, desc, val);
            }
            else if(type === 'inc'){
                newItem = new Income(id, desc, val)
            }
            //Push new element into data structure
            data.allItems[type].push(newItem);

            //Return new element
            return newItem;
        },

        deleteItem: function (type, id){
            
            var ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id); 
            if(index!==-1) {
                
                data.allItems[type].splice(index,1);
            }

        },

        calculateBudget: function (){
            //calculate incomes and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            //calculate total budget
            data.budget = data.totals.inc - data.totals.exp;

            //calculate procentage
            if(data.totals.inc > 0)  
            data.percentage = Math.round((data.totals.exp / data.totals.inc) *100);
            else data.percentage = -1;

        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },


        calculatePercentages: function() {
            data.allItems.exp.forEach(element => {
                element.calcPercentage(data.totals.inc);
            });
            
        },

        getPercentages: function(){

            var allPerc = data.allItems.exp.map(element => {
                return element.getPercentage();
            })
            return allPerc;

        },

        testing: function(){
            console.log(data);
        }
    }

})();

//UI CONTROLLER
var UIController = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentages: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    var formatNumber = function(num,type){

        var numSplit, int, dec;
        // +/- before number
        num = Math.abs(num);
        
        //exactly 2 decimal points
        num = num.toFixed(2);
        //coma seperating thousands
        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3){
            int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3, 3);
        }
        dec = numSplit[1];

        return (type==='exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback){
        for(var i=0; i<list.length; i++){
            callback(list[i],i);
        }
    };

    return{
        getInput: function() {
            return{
                type: document.querySelector(DOMstrings.inputType).value, //either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            }
        },
        getDOMstrings: function() {
            return DOMstrings;
        },
        addListItem: function(object, type) {

            var html, newhtml, element;

            // 1. Create html string with placeholder
            if (type === 'exp'){
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'

            }
            else if (type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            // 2. Replace the placeholder with actual data
            newhtml = html.replace('%id%', object.id);
            newhtml = newhtml.replace('%description%', object.description);
            newhtml = newhtml.replace('%value%', formatNumber(object.value,type));

            // 3. Insert the html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newhtml)
        },
        deleteListItem: function(itemID) {

            var element = document.getElementById(itemID);
            element.parentNode.removeChild(element);
        },
        clearFields: function() {
            var fields;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach( function(current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            var type;
            obj.budget>0 ? type='inc' : type='exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');
            
            if(obj.percentage > 0)
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            else
                document.querySelector(DOMstrings.percentageLabel).textContent = '-';
        },

        displayPercentages: function(percentages){

            var fields = document.querySelectorAll(DOMstrings.expensesPercentages);

            nodeListForEach (fields, function(current,index){

                if(percentages[index] >0)
                current.textContent = percentages[index] + '%';
                else
                current.textContent = '-';

            });
        },

        displayMonth: function(){

            var year, month, months;
            var now = new Date();
            year = now.getFullYear();
            month = now.getMonth();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August','September', 'October', 'November', 'December'];
            document.querySelector(DOMstrings.dateLabel).textContent = months[month-1] + ' ' + year;
        },

        changeType: function(){
            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            nodeListForEach(fields, function(curr){
                curr.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
        }

    }
})();

//GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl){

    var setupEventListeners = function () {

        var DOM = UICtrl.getDOMstrings();

        document.addEventListener('keypress', function(event) {
            if( event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);


    };

    var updateBudget = function() {

        var budget;

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        budget = budgetCtrl.getBudget();

        // 3. Display the budget on UI
        UICtrl.displayBudget(budget);
        
    };

    var updatePercentage = function () {

        // 1. Calculate percentage
        budgetCtrl.calculatePercentages();

        // 2. Read % from the budget
        var perc = budgetCtrl.getPercentages();

        // 3. Update UI with the new percentage
        UICtrl.displayPercentages(perc);

    };

    var ctrlAddItem = function() {
        
        var input, newItem;

        // 1. Get the input data
        input = UICtrl.getInput();
        console.log(input);

        // Check if the inputs are correctly filled
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){

            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add new item to the interface
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();
            
            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentage();
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            console.log(type,ID);

            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentage();
        }
    };

    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListeners();
            
        }
    };
    

})(budgetController, UIController);

controller.init();