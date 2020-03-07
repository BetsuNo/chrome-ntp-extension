
export default class ContextMenu
{
	static setUp()
	{
		const parent = chrome.contextMenus.create({
			id: 'bookmarks-root',
			type: 'normal',
			title: chrome.i18n.getMessage('CONTEXT_MENU_BOOKMARKS'),
			contexts: ['link'],
			targetUrlPatterns: [`*://${chrome.runtime.id}/*`],
		});
		chrome.contextMenus.create({
			parentId: parent,
			id: 'bookmarks-change',
			type: 'normal',
			title: chrome.i18n.getMessage('CONTEXT_MENU_CHANGE'),
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
			title: chrome.i18n.getMessage('CONTEXT_MENU_REMOVE'),
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