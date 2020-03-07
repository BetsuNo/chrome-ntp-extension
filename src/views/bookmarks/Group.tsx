import {h, Component} from 'preact';
import Bookmark from './Bookmark';

interface IProps
{
	bookmark: chrome.bookmarks.BookmarkTreeNode,
	onOpen: () => any,
	direction?: Direction,
	childOptions: Partial<IProps>
}

interface IState
{
	isOpened: boolean
}

enum Direction
{
	Horizontal,
	Vertical,
}

export class Group extends Component<IProps, IState>
{
	static readonly Direction = Direction;

	containerElement: HTMLElement;
	listElement: HTMLElement;
	list: Group[] = [];

	static defaultProps = {
		onOpen: () => {},
		direction: Direction.Horizontal,
	};

	state: IState = {
		isOpened: false,
	};

	componentDidMount(): void
	{
		this.calcOffset();
	}

	componentDidUpdate(previousProps: Readonly<IProps>, previousState: Readonly<IState>, snapshot: any): void
	{
		this.calcOffset();
	}

	toggle(event: any, state?: boolean)
	{
		event?.preventDefault();
		if (event?.button > 0) {
			return;
		}

		const newState = state === undefined
			? !this.state.isOpened
			: state;

		if (newState) {
			this.props.onOpen();
		} else {
			this.closeAll();
		}

		this.setState({isOpened: newState});

		return false;
	}

	closeAll()
	{
		this.list.forEach((item) => {
			item?.toggle(null,false);
		});
	}

	onChildOpen()
	{
		this.closeAll();
	}

	calcOffset()
	{
		const listRect = this.listElement.getBoundingClientRect();

		let left = 0, top = 0;
		switch (this.props.direction)
		{
			case Direction.Horizontal:
				const contRect = this.containerElement.getBoundingClientRect();
				if (contRect.left + contRect.width + listRect.width > window.innerWidth) {
					left = -listRect.width;
				} else {
					left = contRect.width;
				}
				break;
			case Direction.Vertical:
				left = Math.min(window.innerWidth - (listRect.left + listRect.width), 0);
				top = 100;
				break;
		}

		this.listElement.style.left = `${left}px`;
		this.listElement.style.top = `${top}%`;
	}

	className(): string
	{
		let name = 'list';
		if (this.state.isOpened) {
			name += ' open';
		}
		return name;
	}

	render()
	{
		const {bookmark} = this.props;

		if (!bookmark) {
			return;
		}

		this.list = [];

		return <li className="group" ref={(ref) => this.containerElement = ref}>
			<a href={`http://${chrome.runtime.id}/group-${bookmark.id}`}
			   onClick={this.toggle.bind(this)} onAuxClick={this.toggle.bind(this)}>
				<div className="icon fas fa-folder-open" />
				<div className="title">{bookmark.title}</div>
			</a>
			<ul className={this.className()} ref={(ref) => this.listElement = ref}>
				{bookmark.children.map((value => {
					if (value.children) {
						return <Group {{...{
							ref: (ref) => this.list.push(ref),
							bookmark: value,
							onOpen: this.onChildOpen.bind(this),
							parent: this,
						}, ...this.props.childOptions}} />;
					}
					return <Bookmark bookmark={value} />;
				}))}
			</ul>
		</li>
	}
}
