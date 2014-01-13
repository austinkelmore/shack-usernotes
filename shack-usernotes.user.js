// ==UserScript==
// @name        shack-usernotes
// @namespace   https://github.com/gimpyprophet/shack-usernotes
// @description Adds a notes box that saves notes per user
// @include http://shacknews.com/*
// @include http://www.shacknews.com/*
// @exclude http://www.shacknews.com/frame_chatty.x*
// @exclude http://bananas.shacknews.com/*
// @exclude http://*.gmodules.com/*
// @exclude http://*.facebook.com/*
// @version     0.1
// @grant GM_addStyle
// @grant GM_getValue
// @grant GM_setValue
// @grant unsafeWindow
// ==/UserScript==

(function()
{
	function getElementByClassName(element, tag_name, class_name)
	{
		try
		{
			var elements = element.getElementsByTagName(tag_name);
			for (var i = 0; i < elements.length; i++)
			{
				if (elements[i].className.indexOf(class_name) == 0)
				{
					return elements[i];
				}
			}
		}
		catch (ex)
		{
			return null;
		}

		return null;
	}

	function showUserNotesBox()
	{

	}

	function createButton(username)
	{
		var button = document.createElement("a");
		button.id = "notes_" + username;
		button.addEventListener("click", showUserNotesBox, false);
		button.className = "usernotes_button";
		button.setAttribute('style', 'color: grey !important; font-weight: normal; padding: 0 0.15em;');
		button.appendChild(document.createTextNode("Notes:"));
		
		var span = document.createElement("span");
		span.appendChild(document.createTextNode("["));
		span.appendChild(button);
		span.appendChild(document.createTextNode("]"));
		span.style.padding = '0 0.125em';
		
		return span;	
	}

	function getIdList()
	{
		// retrieves a comma-separated list of all the root posts on a page
		var items = document.evaluate("//div[contains(@class, 'fullpost')]/..", document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
		var id_list = '';
		var i = 0;
		for (item = null, i = 0; item = items.snapshotItem(i); i++) {
			id_list += id_list.length ? ',' : '';
			id_list += item.id.substr(5);
		}
		return id_list;
	}

	function installNotesButtons()
	{
		var id_list = getIdList();
		var thread_ids = String(id_list).split(',');

		for (var i = 0; i < thread_ids.length; i++)
		{
			var thread_id = thread_ids[i];

			if (document.getElementById('usernotes_' + thread_id) !== null)
			{
				continue;
			}

			// get thread
			var thread = document.getElementById('item_' + thread_id);
			if (!thread)
			{
				console.log('Could not find thread!');
				continue;
			}

			// get post metadata
			var span_author = getElementByClassName(thread, 'span', 'author');
			if (!span_author)
			{
				continue;
			}

			if (span_author.firstChild)
			{
				// todo: akelmore - look and see if there's any notes already for this user

				var div_user_notes = document.createElement('div');
				div_user_notes.setAttribute('style', 'display: inline; float: none; padding-left: 10px; font-size: 14px;');
				div_user_notes.setAttribute('id', 'usernotes_' + thread_id);

				var username = span_author.firstChild.textContent;

				var button = createButton(username);

				div_user_notes.appendChild(button);

				span_author.appendChild(div_user_notes);
			}
		}
	}


	// MAIN
	if (typeof(getElementByClassName(document, 'div', 'commentsblock')) != 'undefined')
	{
		installNotesButtons();
	}

}
)();
