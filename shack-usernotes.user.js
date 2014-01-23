// ==UserScript==
// @name        shack-usernotes
// @namespace   https://github.com/gimpyprophet/shack-usernotes/raw/master/shack-usernotes.user.js
// @description Adds a notes box that saves notes per user
// @include http://shacknews.com/*
// @include http://www.shacknews.com/*
// @exclude http://www.shacknews.com/frame_chatty.x*
// @exclude http://bananas.shacknews.com/*
// @exclude http://*.gmodules.com/*
// @exclude http://*.facebook.com/*
// @version     1.0
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

	function moveCaretToEnd(el)
	{
	    if (typeof el.selectionStart == "number")
	    {
	        el.selectionStart = el.selectionEnd = el.value.length;
	    }
	    else if (typeof el.createTextRange != "undefined")
	    {
	        el.focus();
	        var range = el.createTextRange();
	        range.collapse(false);
	        range.select();
	    }
	}

	function showUserNotesBox(evt)
	{
		var usernotesboxform = document.getElementById("usernotesboxform_" + evt.target.postid);
		if (usernotesboxform == null)
			createNotesBox(evt.target.shackname, evt.target.postid);
		else
		{
			usernotesboxform.parentNode.removeChild(usernotesboxform);
			evt.preventDefault();
		}
	}

	function createButton(shackname, postid)
	{
		var note_text = "";
		if (GM_getValue(shackname, "") != undefined)
			note_text = GM_getValue(shackname, "");

		if (note_text.length > 50)
			note_text = note_text.substr(0, 47) + "...";

		var button = document.createElement("a");
		button.id = "usernotes_" + postid;
		button.postid = postid;
		button.shackname = shackname;
		button.addEventListener("click", showUserNotesBox, false);
		button.className = "usernotes_button";
		button.setAttribute('style', 'color: grey !important; font-weight: normal; padding: 0 0.15em;');
		if (note_text.length > 0)
			button.appendChild(document.createTextNode("Notes: " + note_text));
		else
			button.appendChild(document.createTextNode("Notes"));
		
		var span = document.createElement("span");
		span.appendChild(document.createTextNode("["));
		span.appendChild(button);
		span.appendChild(document.createTextNode("]"));
		span.style.padding = '0 0.125em';
		
		return span;	
	}

	function updateButtons(shackname, notes_string)
	{
		var buttons = document.getElementsByClassName("usernotes_button");
		for (var i = 0; i < buttons.length; i++)
		{
			var button = buttons[i];
			if (button.shackname == shackname)
			{
				button.removeChild(button.firstChild);
				var note_text = notes_string;
				if (notes_string.length > 50)
					note_text = notes_string.substr(0, 47) + "...";

				if (note_text.length > 0)
					button.appendChild(document.createTextNode("Notes: " + note_text));
				else
					button.appendChild(document.createTextNode("Notes"));
			}
		}
	}

	function getIdList()
	{
		// retrieves a comma-separated list of all the root posts on a page
		var items = document.evaluate("//div[contains(@class, 'fullpost')]/..", document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
		var id_list = '';
		var i = 0;
		for (item = null, i = 0; item = items.snapshotItem(i); i++)
		{
			id_list += id_list.length ? ',' : '';
			id_list += item.id.substr(5);
		}
		return id_list;
	}

	function on_usernotes_close(evt)
	{
		var usernotesboxform = document.getElementById("usernotesboxform_" + evt.target.postid);
		if (usernotesboxform)
			usernotesboxform.parentNode.removeChild(usernotesboxform);

		evt.preventDefault();
	}

	function on_usernotes_save(evt)
	{
		var textbox = document.getElementById("frm_body_" + evt.target.postid);
		if (textbox)
		{
			GM_setValue(evt.target.shackname, textbox.value);
		}

		// update the buttons with the new text
		updateButtons(evt.target.shackname, textbox.value);

		var usernotesboxform = document.getElementById("usernotesboxform_" + evt.target.postid);
		if (usernotesboxform)
		{

			usernotesboxform.parentNode.removeChild(usernotesboxform);
		}
		//GM_setValue(evt.shackname, )
		evt.preventDefault();
	}

	function createNotesBox(shackname, postid)
	{
		var notes_button = document.getElementById("usernotes_" + postid);
		if (!notes_button)
			return;

		// 	div class="usernotesboxform (sometimes has formopen)" NOT USING RIGHT NOW
		//		div class="usernotesbox"
		//			div id="postbox" class="postbox"
		//				div class="postform"
		//				div class="closeform"
		//					a title="Close Form"

		var notebox_div = document.createElement("div");
		notebox_div.className = "usernotesboxform";
		notebox_div.id = "usernotesboxform_" + postid;

		var postbox = document.createElement("div");
		postbox.id = "usernotesbox";
		postbox.className = "usernotesbox";
		notebox_div.appendChild(postbox);

		var closebutton = document.createElement("div");
		closebutton.className = "closeform";
		postbox.appendChild(closebutton);

		var close_a = document.createElement("a");
		close_a.appendChild(document.createTextNode("x"));
		close_a.postid = postid;
		close_a.addEventListener("click", on_usernotes_close, false);
		close_a.href = "#";
		closebutton.appendChild(close_a);

		var span = document.createElement("span");
		span.appendChild(document.createTextNode(shackname + "\'s Notes:"));
		postbox.appendChild(span);

		var textbox_div = document.createElement("div");
		textbox_div.className = "ctextarea";

		var textarea = document.createElement("textarea");
		textarea.id = "frm_body_" + postid;
		textarea.autofocus = true;
		textarea.onkeydown = "";
		textarea.name = "body";
		textarea.onblur = "typing=false";
		textarea.onfocus = "typing=true; this.value = this.value;";
		if (GM_getValue(shackname, "") != undefined)
			textarea.value = GM_getValue(shackname, "");

		var save_button = document.createElement("button");
	    save_button.appendChild(document.createTextNode('Save Notes'));
	    save_button.shackname = shackname;
	    save_button.postid = postid;
	    save_button.addEventListener("click", on_usernotes_save, false);

	    var save_div = document.createElement("div");
	    save_div.className = "csubmit";
	    save_div.appendChild(save_button);

		textbox_div.appendChild(textarea);
		postbox.appendChild(textbox_div);
		postbox.appendChild(save_div);

		notes_button.appendChild(notebox_div);

		textarea.focus();
		moveCaretToEnd(textarea);
	}

	function installNotesButtons()
	{
		var id_list = getIdList();
		var thread_ids = String(id_list).split(',');

		for (var i = 0; i < thread_ids.length; i++)
		{
			var thread_id = thread_ids[i];

			if (document.getElementById('usernotes_' + thread_id) !== null)
				continue;

			// get thread
			var thread = document.getElementById('item_' + thread_id);
			if (!thread)
				continue;

			// get post metadata
			var span_author = getElementByClassName(thread, 'span', 'author');
			var span_user = getElementByClassName(thread, 'span', 'user');
			if (!span_author || !span_user)
				continue;

			if (span_author.firstChild)
			{
				var div_user_notes = document.createElement('div');
				div_user_notes.setAttribute('style', 'display: inline; float: none; padding-left: 10px; font-size: 14px;');
				div_user_notes.setAttribute('id', 'usernotes_' + thread_id);

				var shackname = span_user.firstChild.textContent;

				var button = createButton(shackname, thread_id);

				div_user_notes.appendChild(button);

				span_author.appendChild(div_user_notes);
			}
		}
	}


	// MAIN
	if (typeof(getElementByClassName(document, 'div', 'commentsblock')) != 'undefined')
	{
		GM_addStyle("div.usernotesboxform { z-index: 20000000; width: 510px; height: 190px; margin: 0; padding: 15px; border: 2px solid #0099ff; background-color: #222; position: absolute; top: 50px; left: -2px; }");
		GM_addStyle("div.usernotesbox textarea { background-color: #000; color: #fff; border: 1px solid #fff; width: 500px; height: 120px; padding: 3px; }");
		GM_addStyle("div.usernotesbox div.ctextarea { float: left; width: 570px; margin-bottom: 10px; postition:relative; }");
		GM_addStyle("div.usernotesbox div.closeform a:link, div.closeform a:visited, div.closeform a:active, div.closeform a:hover { position: absolute; top: 0; right: 0; text-transform: lowercase; display: block; width: 20px; height: 20px; color: #9c9c9c; text-align: center; line-height: 20px; font-size: 10px; }");
		GM_addStyle("div.usernotesbox div.csubmit button { background-color: #e9e9de; border-width: 2px; border-color: #fff #e9e9de #e9e9de #fff; color: #000; font-weight: bold; width: 125px; height: 30px; font-size: 14px; margin: 0 auto; }");
		GM_addStyle("div.usernotesbox div.csubmit { width: 125px; height: 30px; font-size: 14px; margin: 0 auto; }");
		GM_addStyle("div.usernotesbox span { font-weight: bold; color: rgb(243, 231, 181); }");

		installNotesButtons();
	}

	// Create event handler to watch for DOMNode changes
	document.addEventListener('DOMNodeInserted', function(e) 
	{
		if (e.target.className.indexOf('fullpost') !== -1)
		{
			installNotesButtons();
		}
		
		if (e.target.id.indexOf('root_') !== -1)
		{
			installNotesButtons(); 
		}
	}, false);

}
)();
