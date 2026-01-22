import { tagToString, TemplateFragment, html } from "tshtml";

export class BaseFormTemplate {
    protected getTitle(): string {
        return "Base Form";
    }

    protected getFields(): TemplateFragment {
        return html`<p>Base form fields</p>`;
    }

    protected build(): TemplateFragment {
        return html`
            <form class="form-container">
                <h2>${this.getTitle()}</h2>
                ${this.getFields()}
                <button type="submit">Submit</button>
            </form>
        `;
    }

    toString(): string {
        return tagToString(this.build());
    }
}

export default BaseFormTemplate;
