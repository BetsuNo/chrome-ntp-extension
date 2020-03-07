import {Component, h} from 'preact';
import Modal from '../Modal';

export interface IEditableBookmark
{
	id: string;
	type: 'bookmark' | 'group';
	title: string;
	url?: string;
	mode: string;
}

export interface IProps
{
	bookmark?: IEditableBookmark;
	onDone?: () => any;
}

interface IState
{
	bookmark?: IEditableBookmark;
}

export default class EditModal extends Component<IProps, IState>
{
	private modal: Modal;
	private titleInput: HTMLInputElement;
	private urlInput: HTMLInputElement;

	state: IState = {
		bookmark: this.props.bookmark
	};

	componentWillReceiveProps(nextProps: Readonly<IProps>, nextContext: any): void
	{
		console.warn(nextProps);
		this.setState({bookmark: nextProps.bookmark});
	}

	saveChanges()
	{
		this.modal?.hide();
		chrome.bookmarks.update(this.props.bookmark.id, {
			title: this.titleInput.value,
			url: this.urlInput.value,
		});
	}

	remove()
	{
		this.modal?.hide();
		chrome.bookmarks.remove(this.props.bookmark.id);
	}

	renderEditForm()
	{
		const bookmark = this.state.bookmark;
		return <div className="bookmark-edit-form">
			<p>{chrome.i18n.getMessage('LABEL_TITLE')}</p>
			<input ref={(ref) => this.titleInput = ref} value={bookmark?.title} />
			{bookmark?.type === 'bookmark' && (
				<div>
					<p>{chrome.i18n.getMessage('LABEL_URL')}</p>
					<input ref={(ref) => this.urlInput = ref} value={bookmark?.url} />
				</div>
			)}
			<div className="btn-holder">
				<button onClick={() => this.modal.hide()}>
					{chrome.i18n.getMessage('BUTTON_CANCEL')}
				</button>
				<button onClick={() => this.saveChanges()}>
					{chrome.i18n.getMessage('BUTTON_SAVE')}
				</button>
			</div>
		</div>
	}

	renderRemoveForm()
	{
		return <div className="bookmark-edit-form">
			<p>{chrome.i18n.getMessage('REMOVE_POPUP_MESSAGE')}</p>
			<div className="btn-holder">
				<button onClick={() => this.modal.hide()}>
					{chrome.i18n.getMessage('BUTTON_CANCEL')}
				</button>
				<button onClick={() => this.remove()}>
					{chrome.i18n.getMessage('BUTTON_REMOVE')}
				</button>
			</div>
		</div>
	}

	render()
	{
		const bookmark = this.state.bookmark;
		return <Modal ref={(ref) => this.modal = ref} onClose={() => this.props.onDone()} show={!!bookmark}>
			{bookmark?.mode === 'edit' && this.renderEditForm()}
			{bookmark?.mode === 'remove' && this.renderRemoveForm()}
		</Modal>;
	}
}