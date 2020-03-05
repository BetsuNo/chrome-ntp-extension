
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
			onclick: console.log,
		});
		chrome.contextMenus.create({
			parentId: parent,
			id: 'bookmarks-remove',
			type: 'normal',
			title: 'Remove',
			contexts: ['link'],
			onclick: console.log,
		});
	}
}