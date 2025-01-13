export class EditorController {
  private element: HTMLElement;

  constructor(element: HTMLElement) {
    this.element = element;
    this.setupEditor();
  }

  private setupEditor(): void {
    this.element.addEventListener('paste', this.handlePaste.bind(this));
    this.element.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private handlePaste(e: ClipboardEvent): void {
    e.preventDefault();
    const text = e.clipboardData?.getData('text/plain') || '';
    document.execCommand('insertText', false, text);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '    ');
    }
  }

  public setContent(content?: string): void {
    this.element.innerHTML = content || '';
  }

  public getContent(): string {
    return this.element.innerHTML;
  }

  public destroy(): void {
    this.element.removeEventListener('paste', this.handlePaste);
    this.element.removeEventListener('keydown', this.handleKeyDown);
  }
} 