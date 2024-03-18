import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Form from '../components';
import * as Validation from '../validators/common';
import * as Framework from '../classes';
/**
 * @class FormBuilder
 * enable the creation of editable forms for data model T
 * handles the rendering and validation of inputs
 */

export interface FieldOptions {
	disabled?: boolean;
	additionalContent?: JSX.Element;
	className?: string;
	maxLength?: number;
	noTitle?: boolean;
	handleKeyPress?: boolean;
	labelPosition?: 'left' | 'right';
	hideValidation?: boolean;
}

export interface NumberOptions extends FieldOptions {
	decimals?: number;
	min?: number;
	format?: string;
	width?: string;
}

export interface YesNoOptions extends FieldOptions {
	yesOptionCaption?: string;
	noOptionCaption?: string;
}

export interface CheckBoxOptions extends FieldOptions {
	horizontal?: boolean;
}

export interface AutoCompleteOptions extends FieldOptions {
	allowAddNew?: boolean;
}

export interface MultiSelectOptions extends FieldOptions {
	noneSelectedText?: string;
}

export interface DropdownOptions extends FieldOptions {
	hasOptionsLabel?: boolean;
}


export class FormBuilder<T> {
	// the data model
	private model: T;
	// collection of fields to be rendered
	private fields: { (key: number): JSX.Element }[];
	// callback to run when changes are made to the model
	private onChange: { (m: T): void };
	// flag to disable inputs
	private disabled: boolean;
	// flag to switch form layout to use wider fields (i.e. form-control class)
	private altLayout: boolean;
	// flag to switch to displaying fields inline
	private inlineLayout: boolean;
	// flag to switch to displaying validation errors in a smaller area (for popups)
	private hasNarrowErrors: boolean;

	private _qa: string;

	constructor(model?: T) {
		this.model = model || {} as T;
		this.fields = [];
		this.disabled = false;
		this.altLayout = false;
		this.inlineLayout = false;
		this.hasNarrowErrors = false;
	}

	getModel(): T {
		return Object.assign({}, this.model);
	}

	setChangeHandler(fn: { (m: T): void }): this {
		this.onChange = fn;
		return this;
	}

	// Disable input elements
	isDisabled(disabled: boolean): this {
		this.disabled = disabled;
		return this;
	}

	// Set form to be rendered wider (i.e. form-control class)
	isWide(wide: boolean): this {
		this.altLayout = wide;
		return this;
	}

	isInline(isInline: boolean): this {
		this.inlineLayout = isInline;
		return this;
	}

	narrowErrors(isNarrow: boolean): this {
		this.hasNarrowErrors = isNarrow;
		return this;
	}

	private addField(
		title: string,
		content: JSX.Element,
		validation: Validation.Result,
		options: FieldOptions,
		qa: string,
	): this {
		this.fields.push((i: number) =>
			<Form.Field
				key={i}
				title={title}
				validation={validation}
				altLayout={this.altLayout}
				inlineLayout={this.inlineLayout}
				additionalContent={options && options.additionalContent}
				className={options && options.className}
				allowNoTitle={options && options.noTitle}
				labelPosition={(options && options.labelPosition) || 'left'}
				hideValidation={(options && options.hideValidation)}
				narrowErrors={this.hasNarrowErrors}
				qa={qa}
			>
				{content}
			</Form.Field>
		);
		return this;
	}

	private addListGroupField(
		content: JSX.Element,
		newValidation: Validation.Result,
		qa: string
	): this {
		this.fields.push((i: number) =>
			<Form.ListGroupField
				key={i}
				validation={newValidation}
				qa={qa}
			>
			{content}
			</Form.ListGroupField>
		);
		return this;
	}

	addTextArea(
		title: string,
		getValue: { (m: T): string },
		setValue: { (m: T, v: string): void },
		qa: string,
		validation?: Validation.Result,
		placeHolder?: string,
		options?: FieldOptions): this {
		const input = (
			<Form.TextArea
				value={getValue(this.model)}
				onChange={value => this.handleChange(value, setValue)}
				disabled={this.disabled || (options && options.disabled)}
				isFormControl={this.altLayout}
				placeholder={placeHolder || null}
				qa={qa}
			/>
		);
		return this.addField(title, input, validation, options, qa);
	}

	addLabel(
		title: string,
		getValue: { (m: T): string },
		qa: string
	): this {
		const label = (<label style={{ 'margin-top': '8px' }}>{getValue(this.model)}</label>);
		return this.addField(title, label, null, null, qa);
	}


	addPasswordInput(
		title: string,
		getValue: { (m: T): string },
		setValue: { (m: T, v: string): void },
		qa: string,
		validation?: Validation.Result,
		options?: FieldOptions
	): this {
		const input = (
			<Form.TextInput
				value={getValue(this.model)}
				handleKeyTyped={options && options.handleKeyPress}
				onChange={value => this.handleChange(value, setValue)}
				disabled={this.disabled || (options && options.disabled)}
				isFormControl={this.altLayout}
				type="password"
				maxLength={options && !!options.maxLength ? options.maxLength : null}
				qa={qa}
			/>
		);
		return this.addField(title, input, validation, options, qa);
	}

	addTextInput(
		title: string,
		getValue: { (m: T): string },
		setValue: { (m: T, v: string): void },
		qa: string,
		validation?: Validation.Result,
		options?: FieldOptions,
		showField = true
	): this {
		if (!showField) {
			return this;
		}
		const input = (
			<Form.TextInput
				value={getValue(this.model)}
				onChange={value => this.handleChange(value, setValue)}
				disabled={this.disabled || (options && options.disabled)}
				isFormControl={this.altLayout}
				maxLength={options && !!options.maxLength ? options.maxLength : null}
				qa={qa}
			/>
		);
		return this.addField(title, input, validation, options, qa);
	}

	addCheckBox(
		title: string,
		getValue: { (m: T): boolean },
		setValue: { (m: T, v: boolean): void },
		qa: string,
		additionalContent?: JSX.Element,
		validation?: Validation.Result,
		options?: FieldOptions
	): this {
		const input = (
			<Form.CheckBox
				value={getValue(this.model)}
				onChange={value => this.handleChange(value, setValue)}
				disabled={this.disabled || (options && options.disabled)}
				isFormControl={this.altLayout}
				qa={qa}
			/>
		);
		const field = (<div>{input}{additionalContent || title}</div>);
		return this.addField(title, field, validation, options, qa);
	}

	addDropdown<TItem extends { name: string }>(  // enforces the existence of a 'name' property in the TItem Dto
		title: string,
		options: TItem[],
		getValue: { (m: T): TItem },
		setValue: { (m: T, value: TItem): void },
		qa: string,
		validation?: Validation.Result,
		fieldOptions?: DropdownOptions,
		showField = true
	): this {
		if (!showField) {
			return this;
		}
		const TypedDropdown = Form.Dropdown as Newable<Form.Dropdown<TItem>>;
		const input = (
			<TypedDropdown
				hasOptionsLabel={fieldOptions && fieldOptions.hasOptionsLabel}
				options={options}
				value={getValue(this.model)}
				onChange={item => this.handleChange(item, setValue)}
				isFormControl={this.altLayout}
				disabled={this.disabled || (fieldOptions && fieldOptions.disabled)}
				name={title}
				qa={qa}
			/>
		);
		return this.addField(title, input, validation, fieldOptions, qa);
	}

	addMultiSelectDropdown<TItem extends { name: string, id: number }>(
		title: string,
		options: TItem[],
		getValue: { (m: T): TItem[] },
		setValue: { (m: T, v: TItem[]): void },
		qa: string,
		validation?: Validation.Result,
		fieldOptions?: MultiSelectOptions
	): this {
		const TypedDropdown = Form.MultiSelectDropdown as Newable<Form.MultiSelectDropdown<TItem>>;
		const input = (
			<TypedDropdown
				options={options}
				value={getValue(this.model)}
				onChange={item => this.handleChange(item, setValue)}
				isFormControl={this.altLayout}
				disabled={this.disabled || (fieldOptions && fieldOptions.disabled)}
				noneSelectedText={fieldOptions && fieldOptions.noneSelectedText}
				qa={qa}
			/>
		);
		return this.addField(title, input, validation, fieldOptions, qa);
	}

	addAutoComplete<TItem>(
		title: string,
		options: TItem[],
		map: { (m: TItem): string },
		getValue: { (m: T): TItem },
		setValue: { (m: T, value: TItem): void },
		qa: string,
		validation?: Validation.Result,
		fieldOptions?: AutoCompleteOptions
	): this {
		const TypedAutoComplete = Form.AutoComplete as Newable<Form.AutoComplete<TItem>>;
		const input = (
			<TypedAutoComplete
				options={options}
				value={getValue(this.model)}
				map={map}
				onChange={item => this.handleChange(item, setValue)}
				isFormControl={this.altLayout}
				disabled={this.disabled || (fieldOptions && fieldOptions.disabled)}
				allowAddNew={fieldOptions && fieldOptions.allowAddNew}
				qa={qa}
			/>
		);
		return this.addField(title, input, validation, fieldOptions, qa);
	}

	addDate(title: string, getValue: { (m: T): Date }, setValue: { (m: T, v: Date): void }, qa: string, validation?: Validation.Result, options?: FieldOptions): this {
		const input = (
			<Form.DateInput
				value={getValue(this.model)}
				disabled={this.disabled || (options && options.disabled)}
				onChange={(v) => this.handleChange(v, setValue)}
				qa={qa}
			/>
		);
		return this.addField(title, input, validation, options, qa);
	}

	addDateTime(title: string, getValue: { (m: T): Date }, setValue: { (m: T, v: Date): void }, qa: string, validation?: Validation.Result, options?: FieldOptions & { showInvalidFormatError?: boolean }): this {
		const input = (
			<Form.DateTimeInput
				value={getValue(this.model)}
				disabled={this.disabled || (options && options.disabled)}
				onChange={(v) => this.handleChange(v, setValue)}
				showInvalidFormatError={options && options.showInvalidFormatError}
				qa={qa}
			/>
		);
		return this.addField(title, input, validation, options, qa);
	}

	addNumber(title: string, getValue: { (m: T): number }, setValue: { (m: T, v: number): void }, qa: string, validation?: Validation.Result, options?: NumberOptions): this {
		const input = (
			<Form.NumberInput
				value={getValue(this.model)}
				disabled={this.disabled || (options && options.disabled)}
				onChange={v => this.handleChange(v, setValue)}
				decimals={options && options.decimals}
				min={options ? options.min : undefined /*null is important*/}
				format={options && options.format}
				width={options && options.width}
				qa={qa}
			/>
		);
		return this.addField(title, input, validation, options, qa);
	}

	addYesNo(title: string, getValue: { (m: T): boolean }, setValue: { (m: T, v: boolean): void }, qa: string, validation?: Validation.Result, options?: YesNoOptions): this {
		const input = (
			<Form.BooleanInput
				name={title}
				value={getValue(this.model)}
				disabled={this.disabled || (options && options.disabled)}
				onChange={item => this.handleChange(item, setValue)}
				yesCaption={options ? options.yesOptionCaption : null}
				noCaption={options ? options.noOptionCaption : null}
				qa={qa}
			/>
		);
		return this.addField(title, input, validation, options, qa);
	}

	addCheckBoxGroup<TItem extends { name: string }>(
		title: string,
		options: TItem[],
		getValue: { (m: T): TItem[] },
		setValue: { (m: T, v: TItem[]): void },
		qa: string,
		validation: Validation.Result,
		fieldOptions?: CheckBoxOptions
	): this {

		const TypedInput = Form.CheckBoxGroup as Newable<Form.CheckBoxGroup<TItem>>;
		const input = (
			<TypedInput
				name={title}
				options={options}
				disabled={this.disabled || (fieldOptions && fieldOptions.disabled)}
				value={getValue(this.model)}
				onChange={item => this.handleChange(item, setValue)}
				horizontal={fieldOptions && fieldOptions.horizontal}
				qa={qa}
			/>
		);
		return this.addField(title, input, validation, fieldOptions, qa);
	}

	addRadioButtonGroup<TItem extends { name: string }>(
		title: string,
		options: TItem[],
		getValue: { (m: T): TItem },
		setValue: { (m: T, v: TItem): void },
		qa: string,
		validation: Validation.Result,
		fieldOptions?: FieldOptions
	): this {
		const TypedInput = Form.RadioButtonGroup as Newable<Form.RadioButtonGroup<TItem>>;
		const input = (
			<TypedInput
				name={title}
				options={options}
				disabled={this.disabled || (fieldOptions && fieldOptions.disabled)}
				value={getValue(this.model)}
				onChange={item => this.handleChange(item, setValue)}
				qa={qa}
			/>
		);
		return this.addField(title, input, validation, fieldOptions, qa);
	}

	addListGroup<TItem extends { name: string, id: number }>(
		title: string,
		options: TItem[],
		getValue: { (m: T): TItem[] },
		setValue: { (m: T, v: TItem[]): void },
		qa: string,
		validation: Validation.Result,
		fieldOptions?: FieldOptions
	): this {
		const TypedInput = Form.ListGroup as Newable<Form.ListGroup<TItem>>;
		const input = (
			<TypedInput
				name={title}
				options={options}
				included={getValue(this.model)}
				onChange={item => this.handleChange(item, setValue)}
				validation={validation}
				qa={qa}
			/>
		);
		return this.addListGroupField(input, validation, qa);
	}

	addCustom(title: string, content: JSX.Element, qa: string, validation?: Validation.Result, options?: FieldOptions) {
		return this.addField(title, content, validation, options, qa);
	}

	addContent(content: JSX.Element, qa: string) {
		return this.addListGroupField(content, null, qa);
	}

	addEmailList(title: string, getValue: { (m: T): string[] }, setValue: { (m: T, v: string[]): void }, qa: string,
		overallValidation?: Validation.Result, emailsValidation?: Validation.Result[],
		options?: FieldOptions & { maxEmails?: number, listDisplayLimit?: number }) {
		
		const emailsValidationArray = emailsValidation != null ? emailsValidation : [];
		const optionsToUse = options || {};
		const controlDisabled = this.disabled || optionsToUse.disabled;
		let placeHolder = controlDisabled
			? ""
			: (optionsToUse.maxEmails ? `Please enter up to ${(optionsToUse.maxEmails)} email addresses separated by a new line` : `Please enter email addresses separated by a new line`);
		let content = (<div>
			<Form.TextArea
				value={(getValue(this.model) || []).join("\r\n")}
				onChange={v => {
					let newEmails = v.length ? v.replace(",", "\r\n").replace(" ", "").split(/\r?\n/).filter(x => /\S/.test(x)) : [];
					this.handleChange(newEmails, setValue);
				}}
				qa={qa}
				disabled={controlDisabled}
				placeholder={placeHolder} />
		</div>)

		if (!optionsToUse.additionalContent) {
			optionsToUse.additionalContent = <Form.EmailListView emailList={getValue(this.model)} displayLimit={(optionsToUse.listDisplayLimit) || 10} validation={emailsValidationArray}/>;
		}

		if (controlDisabled) {
			optionsToUse.additionalContent = undefined;
		}

		return this.addField(title, content, overallValidation, optionsToUse, qa);
	}

	addGroupHeading(title: string, qa: string, classes?: string): this {
		this.fields.push((i: number) =>
			<Form.FormGroupHeading
				key={i}
				title={title}
				classes={classes}
				qa={qa}
			/>);
		return this;
	}

	withQA(qa: string) {
		this._qa = qa;
		return this;
	}

	handleChange(value: any, setValue: { (m: T, v: any): void }) {
		setValue(this.model, value);
		!!this.onChange && this.onChange(this.model);
	}

	renderFields() {
		return this.fields.map((renderFn, i) => renderFn(i));
	}

	render() {
		return (
			<div data-qa={this._qa} className="form-root">
				{
					!!this.altLayout
						? <fieldset className="form-horizontal container-fluid d-flex flex-column">{this.renderFields()}</fieldset>
						: (!!this.inlineLayout ? (<fieldset className="form-grouped">{this.renderFields()}</fieldset>)
							: this.renderFields())
				}
			</div>
		);
	}

	public static for<T>(model: T) {
		return new FormBuilder<T>(model);
	}
};
