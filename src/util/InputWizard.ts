import * as vscode from 'vscode';
import { Disposable } from './Disposable';

type InputStep = {
  type: 'input';
  options: vscode.InputBoxOptions;
  required: boolean;
};

type QuickPickStep = {
  type: 'quickpick';
  options: vscode.QuickPickOptions;
  required: boolean;
  value?: string;
  items: vscode.QuickPickItem[];
};

type Step = InputStep | QuickPickStep;

class QuickPick extends Disposable {
  private readonly input: vscode.QuickPick<vscode.QuickPickItem>;
  constructor(private readonly step: QuickPickStep) {
    super();
    this.input = vscode.window.createQuickPick();
    this.input.items = step.items;
    if (step.value) {
      this.input.value = step.value;
    }
    this.input.title = step.options.title;
    this.input.ignoreFocusOut = step.options.ignoreFocusOut ?? false;
    this.subscriptions.push(this.input);
  }

  public async show(): Promise<string | undefined> {
    return new Promise(res => {
      const onSelect = (val: string) => {
        res(val);
        this.input.hide();
        this.dispose();
      };

      this.input.onDidAccept(() => {
        onSelect(this.input.activeItems[0].label);
      });

      this.input.onDidHide(() => {
        res(undefined);
        this.dispose();
      });

      this.input.onDidChangeSelection(items => {
        onSelect(items[0].label);
      });

      this.input.show();
    });
  }
}

export class InputWizard {
  private static async getInputVal(step: Step, steps: Step[]): Promise<string> {
    let inputVal: string | undefined;
    var index = steps.indexOf(step);
    var title = `${step.options.title} (${index + 1}/${steps.length})`;
    if (step.type === 'input') {
      inputVal = await vscode.window.showInputBox({
        ...step.options,
        ignoreFocusOut: true,
        title: step.required ? title : `${title} (Optional)`,
      });
    } else if (step.type === 'quickpick') {
      inputVal = await new QuickPick({
        ...step,
        options: {
          ...step.options,
          title,
        },
      }).show();
    }
    const isCancelled = inputVal === undefined;
    if (step.required && !isCancelled && !inputVal) {
      throw new Error('Invalid input');
    }
    return inputVal || '';
  }

  public static async getInputs(steps: Step[]): Promise<string[]> {
    try {
      const inputValues: string[] = [];
      for (const step of steps) {
        const inputVal = await this.getInputVal(step, steps);
        inputValues.push(inputVal);
      }
      return inputValues;
    } catch (e) {
      void vscode.window.showErrorMessage('Invalid input');
      return [];
    }
  }
}
