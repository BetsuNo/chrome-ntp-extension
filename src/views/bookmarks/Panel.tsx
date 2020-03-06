import {h, Component} from 'preact';
import {Group} from './Group';
import './bookmarks.scss';

interface IState
{
	main: chrome.bookmarks.BookmarkTreeNode;
	second: chrome.bookmarks.BookmarkTreeNode;
}

export default class Panel extends Component<any, IState>
{
	private readonly changesListener: () => any;

	container: HTMLDivElement;
	mainGroup: Group;
	secondGroup: Group;

	state: IState = {
		main: undefined,
		second: undefined,
	};

	constructor(props, context)
	{
		super(props, context);
		this.changesListener = this.bookmarksChanged.bind(this);
	}

	componentWillMount(): void
	{
		this.loadBookmarks();
		chrome.contextMenus.onClicked.addListener((itemData, tab) => {
			console.warn(itemData, tab);
		});
	}

	componentDidMount(): void
	{
		document.addEventListener('click', this.onOutsideClick.bind(this));
		chrome.bookmarks.onChanged.addListener(this.changesListener);
		chrome.bookmarks.onCreated.addListener(this.changesListener);
		chrome.bookmarks.onRemoved.addListener(this.changesListener);
		chrome.bookmarks.onMoved.addListener(this.changesListener);
	}

	componentWillUnmount(): void
	{
		chrome.bookmarks.onChanged.removeListener(this.changesListener);
		chrome.bookmarks.onCreated.removeListener(this.changesListener);
		chrome.bookmarks.onRemoved.removeListener(this.changesListener);
		chrome.bookmarks.onMoved.removeListener(this.changesListener);
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

		this.closeAll();
	}

	closeAll()
	{
		this.mainGroup?.closeAll();
		this.secondGroup?.toggle(null, false);
	}

	onOpen()
	{
		this.closeAll();
	}

	render()
	{
		const {main, second} = this.state;

		return <div className="bookmarks-panel" ref={(ref) => this.container = ref}>
			<ul className="second-panel">
				{second && <Group {{
					ref: (ref) => this.secondGroup = ref,
					bookmark: second,
					onOpen: this.onOpen.bind(this),
					direction: Group.Direction.Vertical,
				}} />}
			</ul>
			<ul className="main-panel">
				{second && <Group {{
					ref: (ref) => this.mainGroup = ref,
					bookmark: main,
					childOptions: {
						onOpen: this.onOpen.bind(this),
						direction: Group.Direction.Vertical,
					},
				}} />}
			</ul>
		</div>;
	}
}