var DashboardController = Composer.Controller.extend({
	inject: tagit.main_container_selector,

	elements: {
		'.sidebar': 'sidebar',
		'.boards': 'boards',
		'.categories': 'categories',
		'.tags': 'tags',
		'.notes': 'notes',
		'.menu': 'menu'
	},

	// profile
	profile: null,

	current_board: null,

	boards_controller: null,
	categories_controller: null,
	tags_controller: null,

	sidebar_timer: null,

	init: function()
	{
		this.render();

		tagit.controllers.HeaderBar.select_app(null, 'notes');

		this.profile = tagit.profile;

		var do_load = function() {
			var current = this.profile.get_current_board();

			this.categories_controller = new CategoriesController({
				inject: this.categories,
				board: current
			});
			this.tags_controller = new TagsController({
				inject: this.tags,
				board: current
			});
			this.notes_controller = new NotesController({
				inject: this.notes,
				board: current
			});

			tagit.controllers.pages.trigger('loaded');
		}.bind(this);

		tagit.loading(true);
		var has_load = false;
		this.profile.bind('change:current_board', function() {
			this.soft_release();
			var current = this.profile.get_current_board();
			if(current && !has_load)
			{
				has_load = true;
				current.bind('notes_updated', function() {
					tagit.loading(false);
					current.unbind('notes_updated', 'board:loading:notes_updated');
				}, 'board:loading:notes_updated');
			}
			do_load();
		}.bind(this), 'dashboard:change_board');

		this.boards_controller = new BoardsController({
			el: this.boards,
			profile: this.profile
		});

		tagit.keyboard.bind('S-/', this.open_help.bind(this), 'dashboard:shortcut:open_help');

		// monitor sidebar size changes
		this.sidebar_timer = new Timer(50);
		this.sidebar_timer.end = this.resize_sidebar.bind(this);
		this.sidebar_timer.start();

		this.profile.trigger('change:current_board');
	},

	soft_release: function()
	{
		if(this.categories_controller) this.categories_controller.release();
		if(this.tags_controller) this.tags_controller.release();
		if(this.notes_controller) this.notes_controller.release();
	},

	release: function()
	{
		this.soft_release();
		if(this.boards_controller) this.boards_controller.release();
		this.profile.unbind('change:current_board', 'dashboard:change_board');
		tagit.keyboard.unbind('S-/', 'dashboard:shortcut:open_help');
		tagit.user.unbind('logout', 'dashboard:logout:clear_timer');
		if(this.sidebar_timer && this.sidebar_timer.end) this.sidebar_timer.end = null;
		this.parent.apply(this, arguments);
	},

	render: function()
	{
		var content = Template.render('dashboard/index');
		this.html(content);
	},

	open_help: function()
	{
		console.log('help!!');
	},

	resize_sidebar: function()
	{
		var scroll = window.getScroll().y;
		var sidepos = this.sidebar.getCoordinates();
		if(sidepos.top <= scroll && this.sidebar.getStyle('position') != 'fixed')
		{
			this._side_orig_top = sidepos.top;
			this.sidebar.setStyles({
				position: 'fixed',
				top: 10
			});
		}
		if(scroll <= this._side_orig_top)
		{
			this.sidebar.setStyles({
				position: '',
				top: ''
			});
		}

		var wheight = window.getCoordinates().height;
		var height = 500;
		if(this.sidebar.getStyle('position') == 'fixed')
		{
			height = wheight;
		}
		else
		{
			var sidepos = this.sidebar.getCoordinates();  // recalculate (sidebar pos may have changed)
			var mtop = sidepos.top;
			height = wheight - mtop;
			height += scroll;
		}
		this.sidebar.setStyles({
			height: height - 5
		});
		this.sidebar_timer.start();
	}
});

