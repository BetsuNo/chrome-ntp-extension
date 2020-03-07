
export default class ContextMenu
{
	static setUp()
	{
		const parent = chrome.contextMenus.create({
			id: 'bookmarks-root',
			type: 'normal',
			title: 'Bookmarks',
			contexts: ['link'],
			targetUrlPatterns: [`*://${chrome.runtime.id}/*`],
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

				chrome.runtime.sendMessage({
					action: 'editBookmark',
					type: matches[1],
					id: matches[2],
				});
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

				chrome.runtime.sendMessage({
					action: 'removeBookmark',
					type: matches[1],
					id: matches[2],
				});
			},
		});
	}
}