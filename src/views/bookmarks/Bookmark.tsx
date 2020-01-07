import {h, Component} from 'preact';

interface IProps
{
	bookmark: chrome.bookmarks.BookmarkTreeNode
}

export default class Bookmark extends Component<IProps, any>
{
	render()
	{
		const {bookmark} = this.props;

		if (!bookmark) {
			return;
		}

		return <li>
			<a href={bookmark.url} title={`${bookmark.title}\n${bookmark.url}`}>
				<div className="icon" style={{backgroundImage: `url(chrome://favicon/${bookmark.url})`}} />
				{bookmark.title && <div className="title">{bookmark.title}</div>}
			</a>
		</li>
	}
}