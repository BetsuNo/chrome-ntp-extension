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

interface IState
{
	bookmark?: IEditableBookmark;
	active: boolean;
}

export default class EditModal extends Component<any, IState>
{
	private modal: Modal;
	private titleInput: HTMLInputElement;
	private urlInput: HTMLInputElement;

	state: IState = {
		bookmark: null,
		active: false,
	};

	show(bookmark: IEditableBookmark)
	{
		console.log('SHOW');
		this.setState({
			bookmark: bookmark,
			active: true,
		});
	}

	hide()
	{
		this.setState({active: false});
	}

	saveChanges()
	{
		this.hide();
		chrome.bookmarks.update(this.state.bookmark.id, {
			title: this.titleInput.value,
			url: this.urlInput.value,
		});
	}

	remove()
	{
		this.hide();
		chrome.bookmarks.remove(this.state.bookmark.id);
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
		const {bookmark, active} = this.state;
		return <Modal ref={(ref) => this.modal = ref} show={active}>
			{bookmark?.mode === 'edit' && this.renderEditForm()}
			{bookmark?.mode === 'remove' && this.renderRemoveForm()}
		</Modal>;
	}
}