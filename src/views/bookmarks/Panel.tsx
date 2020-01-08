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
	container: HTMLDivElement;
	mainGroup: Group;
	secondGroup: Group;

	state: IState = {
		main: undefined,
		second: undefined,
	};

	componentWillMount(): void
	{
		this.loadBookmarks();
	}

	componentDidMount(): void
	{
		document.addEventListener('click', this.onOutsideClick.bind(this));
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
		this.secondGroup?.toggle(false);
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