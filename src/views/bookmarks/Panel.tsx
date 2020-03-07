import {h, Component} from 'preact';
import {Group} from './Group';
import EditModal, {IEditableBookmark} from './EditModal';
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import './bookmarks.scss';

interface IState
{
	main: chrome.bookmarks.BookmarkTreeNode;
	second: chrome.bookmarks.BookmarkTreeNode;
	editMode: boolean;
	editableBookmark?: IEditableBookmark;
}

interface IMessage
{
	action: string;
	type: string;
	id?: any;
}

export default class Panel extends Component<any, IState>
{
	private readonly changesListener: () => any;
	private readonly messagesListener: () => any;
	private modal: EditModal;

	container: HTMLDivElement;
	mainGroup: Group;
	secondGroup: Group;

	state: IState = {
		main:             undefined,
		second:           undefined,
		editMode:         false,
		editableBookmark: null,
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
			return;
		}
		switch (message?.action)
		{
			case 'editBookmark':
				chrome.bookmarks.get(message.id, this.initiateBookmarkChange.bind(this, message.type, 'edit'));
				return;

			case 'removeBookmark':
				chrome.bookmarks.get(message.id, this.initiateBookmarkChange.bind(this, message.type, 'remove'));
				return;
		}
	}

	initiateBookmarkChange(type: 'bookmark' | 'group', mode: 'edit' | 'remove', result: BookmarkTreeNode[])
	{
		const bookmark = result.pop();
		if (!bookmark) {
			return;
		}
		this.modal.show({
			id:    bookmark.id,
			type:  type,
			title: bookmark.title,
			url:   bookmark.url,
			mode:  mode,
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
			<EditModal ref={ref => this.modal = ref} />
		</div>;
	}
}