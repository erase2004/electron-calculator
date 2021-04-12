import React from 'react';
import TitleBar from './title-bar';
import './app.sass';
import { AliasObject, CustomMap } from './share-types';

type DisplayAreaProps = {
  formula: string[];
  current: string;
};
type AppStates = Readonly<DisplayAreaProps & {
  cleared: boolean;
  prev: string;
}>;

const numbers = [
  'zero', 'one', 'two',
  'three', 'four', 'five',
  'six', 'seven', 'eight',
  'nine', '.'
];
const operatorMap: CustomMap<string> = {
  '+': 'add',
  '-': 'subtract',
  '*': 'multiply',
  '/': 'divide'
};

class App extends React.Component<AliasObject, AppStates> {
  readonly state: AppStates = {
    formula: [],
    current: '0',
    prev: '',
    cleared: true
  };
  private readonly clickFn: CustomMap<() => void> = {};
  private readonly throttle: number = 250;

  constructor(props: AliasObject) {
    super(props);

    this.buttonHandler = this.buttonHandler.bind(this);
    this.registerFunction = this.registerFunction.bind(this);
    this.exceedLimit = this.exceedLimit.bind(this);
  }

  componentDidMount(): void {
    window.addEventListener('keypress', (event: KeyboardEvent) => {
      const keyValue: string = event.key;
      
      if (keyValue in this.clickFn) {
        this.clickFn[keyValue]();
      }
    }, true);
  }

  registerFunction(key: string, fn: () => void): void {
    this.clickFn[key] = fn;
  }

  exceedLimit(): void {
    this.setState((state) => {
      setTimeout(() => {
        this.setState({
          current: state.current
        });
      }, this.throttle)

      return {
        current: 'EXCEED THE LIMIT',
        prev: state.current
      };
    });
  }
  
  buttonHandler(keyValue: string): void {
    const current = this.state.current;

    if (current.includes('LIMIT')) return;

    if (operatorMap[keyValue]) {
      return this.addOperator(keyValue);
    }

    if (keyValue == 'c') {
      return this.clearAll();
    }
    
    if (keyValue == 'Enter') {
      return this.calculate();
    }

    const key = parseInt(keyValue);
    if (numbers[key]) {
      return this.addNumber(keyValue);
    }
  }
  
  addNumber(key: string): void {
    let formula = this.state.formula.slice(0);
    let current = this.state.current;
    const lastChar = current.slice(-1);
    const curNum = Number(current);
    const nextNum = Number(current + key);
    const cleared = this.state.cleared;
    
    formula.pop();
    
    if (cleared) {
      // formula is calculated or cleared
      if (key == '10') key = '0.';
      formula = [];
      current = key;
    }
    else {
      if (key == '0') {
        // 1. number with dot sign, start with negative sign, nonzero number (NaN exclude) => append to current
        // 2. arithmetic operator (not '-') => push current into formula, set current to '0'

        const match = current.match(/\./g);
        
        if ((match != null && match.length == 1) || // number with dot sign
          (lastChar == '-') || // start with negative sign
          (Number.isNaN(curNum) == false && curNum !== 0)) // nonzero number (NaN excluded)
        {
          if (nextNum >= Number.MIN_SAFE_INTEGER && nextNum <= Number.MAX_SAFE_INTEGER)
            current += key;
          else
            return this.exceedLimit();
        }
        else if (operatorMap[lastChar] !== undefined) { // arithmetic operator
          formula.push(current);
          current = '0';
        }

      } else if (key == '10') { // dot
        // 1. number without dot sign
        //   i. start with negative sign => append '0.' to current
        //   ii. normal number => append to current
        //   iii. arithmetic operator => push current into formula, set current to '0.'

        const match = current.match(/\./g);
        
        if (match == null) { // no dot exist
          if (lastChar == '-') { // start with negative sign
            current += '0.';
          }
          else if (Number.isNaN(curNum) == false) { // normal number
            current += '.';
          }
          else { // arithmetic operator
            formula.push(current);
            current = '0.';
          }
        }

      } else { // 1-9
        // 1. start with negative sign => append to current
        // 2. normal number => append to current
        // 3. arithmetic operator => arithmetic operator => push current into formula, set current to {input number}

        if (lastChar == '-') { // start with negative sign
          current += key;
        }
        else if (Number.isNaN(curNum) == false) { // normal number
          if (nextNum >= Number.MIN_SAFE_INTEGER && nextNum <= Number.MAX_SAFE_INTEGER)
            current += key;
          else
            return this.exceedLimit();
        }
        else { // arithmetic operator
          formula.push(current);
          current = key;
        }
      }
    }
    
    formula.push(current);
    
    this.setState({
      formula,
      current,
      cleared: false
    })
  }
  
  addOperator(key: string): void {
    let formula = this.state.formula.slice(0);
    let current = this.state.current;
    const lastChar = current.slice(-1);
    const cleared = this.state.cleared;
    
    if (cleared) { // formula is calculated or cleared

      if (formula.length > 0) { // formula is calculated
        formula = formula.slice(-1);
        current = key;
        formula.push(current);
      }
      else { // formula is cleared
        if (key == '-') {
          current = key;
          formula.push(current);
        }
        else {
          return;
        }
      }
    } else {
      if (operatorMap[current] !== undefined) { // arithmetic operator
        if ((lastChar == '*' || lastChar == '/') && (key == '-')) { // *- or /-
          current = key;
          formula.push(current);
        }
        else {
          formula.pop();
          current = key;
          formula.push(current);
        }
      }
      else { // number
        current = key;
        formula.push(current);
      }
    }
    
    this.setState({
      formula,
      current,
      cleared: false
    })
  }
  
  clearAll(): void {
    this.setState({
      formula: [],
      current: '0',
      cleared: true
    });
  }
  
  calculate(): void {
    const formula = this.state.formula.slice(0);
    const tempFormula = formula.slice(0);
    let current = this.state.current;
    const cleared = this.state.cleared;
    
    if (cleared == false) {
      // 1. loop through formula
      // 2. push number into number stack
      // 3. if current element is operator, check the priority of the current operator and the top of the operator stack
      //   i. current > top => push current operator into number stack
      //   ii. current <= top =>
      //     pop top two number from number stack,
      //     do the top operation with the two numbers,
      //     push the result back to number stack,
      //     continue this process until current > top or there is no operator in operator stack
      // 4. the final result is the number in the number stack

      if (operatorMap[current] !== undefined) {
        formula.pop();
      }

      const opStack: string[] = [];
      const numStack: number[] = [];
      const opPri: CustomMap<number> = {
        '+': 1,
        '*': 2,
        '/': 2
      }

      for (let i = 0; i < tempFormula.length; i++) {
        if (i % 2 == 1 && operatorMap[tempFormula[i]] === undefined) {
          tempFormula.splice(i, 0, '+');
        }
      }

      tempFormula.forEach((elem) => {
        const now = Number(elem);

        if (operatorMap[elem] !== undefined) {
          do {
            const lastOp = opStack.pop();
            
            if (lastOp !== undefined) {
              if (opPri[elem] < opPri[lastOp]) {
                const top1 = numStack.pop();
                const top2 = numStack.pop();

                const temp = (lastOp == '*') ? top1! * top2! : top2! / top1!;
                numStack.push(temp);
              } else {
                opStack.push(lastOp);
                break;
              }
            } else {
              break;
            }
          } while (opStack.length > 0);
        
          opStack.push(elem);
        } else {
          numStack.push(now);
        }
      });

      while (opStack.length > 0) {
        const op = opStack.pop();
        const top1 = numStack.pop();
        const top2 = numStack.pop();
        const temp = (op == '*') ? top2! * top1! : 
          (op == '/'  ? top2! / top1! : top2! + top1!);
        
        numStack.push(temp);
      }
      
      const result = numStack.pop();

      current = result!.toString();
      formula.push('=');
      formula.push(current);
    }
    
    this.setState({
      formula,
      current,
      cleared: true
    });
  }
    
  render(): JSX.Element {
    return (
      <div className="container">
        <TitleBar />
        <div className="wrapper">
          <DisplayArea formula={this.state.formula} current={this.state.current}/>
          { numbers.map((v, i) => <NumberButton key={i} val={String(i)} buttonHandler={this.buttonHandler} registerFunction={this.registerFunction} />) }
          { Object.keys(operatorMap).map((v) => <OperatorButton key={v} val={v} buttonHandler={this.buttonHandler} registerFunction={this.registerFunction} />) }
          <ControlButton val="c" buttonHandler={this.buttonHandler} registerFunction={this.registerFunction} />
          <ControlButton val="Enter" buttonHandler={this.buttonHandler} registerFunction={this.registerFunction} />
        </div>
      </div>
    ); 
  }
}

type ComposerProps = {
  val: string
  buttonHandler: (keyValue: string) => void
  registerFunction: (key: string, fn: () => void) => void
}
type ComposerStates = {
  className: string[]
}

function ButtonComposer(WrapperComponent: React.ComponentType<ButtonProps>, buttonType: string) {

  return class Component extends React.Component<ComposerProps, ComposerStates> {
    private readonly displayMap: CustomMap<string> = {
      'c': 'AC',
      'Enter': '=',
      '10': '.'
    };
    private readonly classMap: CustomMap<string> = {
      'c': 'clear',
      'Enter': 'equal',
      '10': 'dot'
    };
    private readonly throttle: number = 100;

    private readonly value: string = this.props.val;
    private readonly display: string = this.displayMap[this.value] || this.value;
    private readonly className: string = this.classMap[this.value] || operatorMap[this.value] || numbers[parseInt(this.value)];

    readonly state: ComposerStates = {
      className: ['btn', buttonType, this.className]
    };

    constructor(props: ComposerProps) {
      super(props);
      this.pressButton = this.pressButton.bind(this);
      const value = this.value == '10' ? '.' : this.value;
      this.props.registerFunction(value, this.pressButton);
    }

    pressButton() {
      let className = this.state.className.slice(0);

      if (className.includes('active') == false) {
        className.push('active');
        this.setState({
          className
        });
        setTimeout(() => {
          className = this.state.className.slice(0);
          className.splice(className.indexOf('active'), 1);

          this.setState({
            className
          });
        }, this.throttle);
        this.props.buttonHandler(this.value);
      }
    }

    render() {
      return (
        <WrapperComponent className={this.state.className.join(' ')} display={this.display} pressButton={this.pressButton} />
      );
    }
  };
}

type ButtonProps = {
  className: string;
  display: string;
  pressButton: () => void;
};
const Button = ({className, display, pressButton}: ButtonProps) => (
  <button className={className} onClick={pressButton}>
    {display}
  </button>
);

const NumberButton = ButtonComposer(Button, 'btn-number');
const OperatorButton = ButtonComposer(Button, 'btn-operator');
const ControlButton = ButtonComposer(Button, 'btn-control');

const DisplayArea = (props: DisplayAreaProps) => {  
  return (
    <div className="display-area">
      <div className="formula">{props.formula.join('')}</div>
      <div className="current" id="display">{props.current}</div>
    </div>
  ); 
}

export default App;
