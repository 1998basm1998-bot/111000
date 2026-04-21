document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const buttons = document.querySelectorAll('.btn');
    
    let currentInput = '';
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.getAttribute('data-value');
            const action = button.getAttribute('data-action');
            
            if (value) {
                currentInput += value;
                display.value = currentInput;
            }
            
            if (action) {
                switch(action) {
                    case 'clear':
                        currentInput = '';
                        display.value = '';
                        break;
                    case 'delete':
                        currentInput = currentInput.toString().slice(0, -1);
                        display.value = currentInput;
                        break;
                    case 'calculate':
                        try {
                            if (currentInput) {
                                const result = new Function('return ' + currentInput)();
                                if(!isFinite(result)) {
                                    throw new Error("Invalid");
                                }
                                display.value = result;
                                currentInput = result.toString();
                            }
                        } catch (error) {
                            display.value = 'خطأ';
                            setTimeout(() => {
                                display.value = currentInput;
                            }, 1500);
                        }
                        break;
                }
            }
        });
    });
});
