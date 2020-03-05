import ContextMenu from './components/ContextMenu';

chrome.runtime.onInstalled.addListener(function () {
	ContextMenu.setUp();
});