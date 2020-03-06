import {h, Component} from 'preact';

interface IProps
{
	bookmark: chrome.bookmarks.BookmarkTreeNode
}

export default class Bookmark extends Component<IProps, any>
{
	onClick(event: MouseEvent)
	{
		event.preventDefault();
		window.location = this.props.bookmark.url as Location;
		return false;
	}

	onAuxClick(event)
	{
		if (event.button === 1) {
			event.preventDefault();
			window.open(this.props.bookmark.url, '_blank');
			return false;
		}
	}

	render()
	{
		const {bookmark} = this.props;

		if (!bookmark) {
			return;
		}

		return <li>
			<a href={`http://ntp.bookmarks/bookmark-${bookmark.id}`} title={`${bookmark.title}\n${bookmark.url}`}
			   onAuxClick={this.onAuxClick.bind(this)} onClick={this.onClick.bind(this)}>
				<div className="icon" style={{backgroundImage: `url(chrome://favicon/${bookmark.url})`}} />
				{bookmark.title && <div className="title">{bookmark.title}</div>}
			</a>
		</li>
	}
}