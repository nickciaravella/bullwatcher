import * as React from 'react';

interface ITextBoxProps {
    onSubmitFunc: (text: string) => void;
    placeholderText?: string;
    showSubmitButton: boolean;
}

interface ITextBoxState {
    text: string,
}

export default class TextBox extends React.Component<ITextBoxProps, ITextBoxState> {

    constructor(props: ITextBoxProps) {
        super(props);

        this.state = {
            text: '',
        };
    }

     public render() {
        const { placeholderText, showSubmitButton } = this.props;
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <input
                        placeholder={placeholderText}
                        onChange={this.handleInputChange}
                    />
                </form>
                {
                   showSubmitButton && <button onClick={this.handleSubmit}>Submit</button>
                }
            </div>
        );
    }

    private handleInputChange = (event: React.ChangeEvent) => {
        const newText: string = (event.target as HTMLInputElement).value;
        this.setState((prevState) => { return {
            text: newText
        }});
   }

    private handleSubmit = (event: React.FormEvent) => {
        const { onSubmitFunc } = this.props;
        const { text } = this.state;

        event.preventDefault();
        onSubmitFunc(text);
    }
}
