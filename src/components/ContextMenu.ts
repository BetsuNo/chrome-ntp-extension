
export default class ContextMenu
{
	static setUp()
	{
		const parent = chrome.contextMenus.create({
			id: 'bookmarks-root',
			type: 'normal',
			title: 'Bookmarks',
			contexts: ['link'],
			targetUrlPatterns: ['*://ntp.bookmarks/*'],
		});
		chrome.contextMenus.create({
			parentId: parent,
			id: 'bookmarks-change',
			type: 'normal',
			title: 'Change',
			contexts: ['link'],
			onclick: function (info) {
				const matches = /\/(bookmark|group)-(.+)$/.exec(info.linkUrl);

				if (!matches) {
					return;
				}

				switch (matches[1])
				{
					case 'bookmark':
						console.log(matches[2]);
						break;

					case 'group':
						break;
				}
			},
		});
		chrome.contextMenus.create({
			parentId: parent,
			id: 'bookmarks-remove',
			type: 'normal',
			title: 'Remove',
			contexts: ['link'],
			onclick: function (info) {
				const matches = /\/(bookmark|group)-(.+)$/.exec(info.linkUrl);

				if (!matches) {
					return;
				}

				switch (matches[1])
				{
					case 'bookmark':
						chrome.bookmarks.remove(matches[2]);
						break;

					case 'group':
						break;
				}
			},
		});
	}
}