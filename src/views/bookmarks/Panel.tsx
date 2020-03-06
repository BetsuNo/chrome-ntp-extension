import {h, Component} from 'preact';
import {Group} from './Group';
import './bookmarks.scss';
import Modal from '../Modal';
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

interface IState
{
	main: chrome.bookmarks.BookmarkTreeNode;
	second: chrome.bookmarks.BookmarkTreeNode;
	editMode: boolean;
	currentBookmark?: BookmarkTreeNode;
}

interface IMessage
{
	action: string;
	id?: any;
}

export default class Panel extends Component<any, IState>
{
	private readonly changesListener: () => any;
	private readonly messagesListener: () => any;

	private modal: Modal;
	private titleInput: HTMLInputElement;
	private urlInput: HTMLInputElement;

	container: HTMLDivElement;
	mainGroup: Group;
	secondGroup: Group;

	state: IState = {
		main:            undefined,
		second:          undefined,
		editMode:        false,
		currentBookmark: null,
	};

	constructor(props, context)
	{
		super(props, context);
		this.changesListener = this.bookmarksChanged.bind(this);
		this.messagesListener = this.onMessage.bind(this);
		chrome.bookmarks.onChanged.addListener(this.changesListener);
		chrome.bookmarks.onCreated.addListener(this.changesListener);
		chrome.bookmarks.onRemoved.addListener(this.changesListener);
		chrome.bookmarks.onMoved.addListener(this.changesListener);
		chrome.runtime.onMessage.addListener(this.messagesListener);
	}

	componentWillMount(): void
	{
		this.loadBookmarks();
	}

	componentDidMount(): void
	{
		document.addEventListener('click', this.onOutsideClick.bind(this));
	}

	componentWillUnmount(): void
	{
		chrome.bookmarks.onChanged.removeListener(this.changesListener);
		chrome.bookmarks.onCreated.removeListener(this.changesListener);
		chrome.bookmarks.onRemoved.removeListener(this.changesListener);
		chrome.bookmarks.onMoved.removeListener(this.changesListener);
		chrome.runtime.onMessage.removeListener(this.messagesListener);
	}

	onMessage(message: IMessage)
	{
		if (!document.hasFocus()) {
			return;;
		}
		switch (message?.action)
		{
			case 'editBookmark':
				chrome.bookmarks.get(message.id, this.initiateBookmarkChange.bind(this));
				return;
		}
	}

	initiateBookmarkChange(result: BookmarkTreeNode[])
	{
		const bookmark = result.pop();
		if (!bookmark) {
			return;
		}
		this.setState({
			editMode:        true,
			currentBookmark: bookmark,
		});
	}

	bookmarksChanged()
	{
		this.loadBookmarks();
	}

	loadBookmarks()
	{
		chrome.bookmarks.getTree((results) => {
			this.setState({
				main: results[0].children[0],
				second: results[0].children[1],
			});
		});
	}

	onOutsideClick(event: MouseEvent)
	{
		let parent = event.target;
		do {
			let el = parent as HTMLElement;
			parent = el.parentNode;

			if (el === this.container) {
				return;
			}
		} while (parent !== document);

		this.closeAllBookmarks();
	}

	closeAllBookmarks()
	{
		this.mainGroup?.closeAll();
		this.secondGroup?.toggle(null, false);
	}

	onBookmarkOpen()
	{
		this.closeAllBookmarks();
	}

	onModalClose()
	{
		this.setState({editMode: false});
	}

	saveChanges()
	{
		this.modal?.hide();
		chrome.bookmarks.update(this.state.currentBookmark.id, {
			title: this.titleInput.value,
			url: this.urlInput.value,
		});
	}

	renderModal()
	{
		return <Modal ref={(ref) => this.modal = ref} onClose={this.onModalClose.bind(this)} show={this.state.editMode}>
			<div className="bookmark-edit-form">
				<p>Title</p>
				<input ref={(ref) => this.titleInput = ref} value={this.state.currentBookmark?.title} />
				<p>URL</p>
				<input ref={(ref) => this.urlInput = ref} value={this.state.currentBookmark?.url} />
				<div className="btn-holder">
					<button onClick={() => this.modal.hide()}>Cancel</button>
					<button onClick={() => this.saveChanges()}>Save</button>
				</div>
			</div>
		</Modal>;
	}

	render()
	{
		const {main, second} = this.state;

		return <div className="bookmarks-panel" ref={(ref) => this.container = ref}>
			<ul className="second-panel">
				{second && <Group {{
					ref: (ref) => this.secondGroup = ref,
					bookmark: second,
					onOpen: this.onBookmarkOpen.bind(this),
					direction: Group.Direction.Vertical,
				}} />}
			</ul>
			<ul className="main-panel">
				{second && <Group {{
					ref: (ref) => this.mainGroup = ref,
					bookmark: main,
					childOptions: {
						onOpen: this.onBookmarkOpen.bind(this),
						direction: Group.Direction.Vertical,
					},
				}} />}
			</ul>
			{this.renderModal()}
		</div>;
	}
}