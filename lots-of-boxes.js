class ticTac {
  constructor($el) {
    this.$el = $el;
    this.$el.html('');
    this.turnClasses = ["x", "o"];
    this.state = { boards: { x: [], o: [], cells: [] } };
    this.turnNumber = 0;

    this.regexes = [
      /^((?:.{3}){0,2}1{3}(?:.{3}){0,2})$/, //horizontal wins
      /(1.{2}1.{2}1)/, //vertical wins
      /^(1.{3}1.{3}1|.{2}1.1.1.{2})$/ //diagonal wins
    ];

    $("body").attr("class", "current_turn_" + this.turnClasses[this.turnNumber % 2]);    
    this.constructDom();
    this.setupListeners();
    this.updateDescription();
  }

  constructDom() {
    this.$el.removeClass('hidden').each(function() {
      for (var i = 0; i < 9; i += 3) {
        $(this).append(
          '<row><board id="board_' +
            i +
            '" class="board"></board><board id="board_' +
            (i + 1) +
            '" class="board"></board><board id="board_' +
            (i + 2) +
            '" class="board"></board></row>'
        );
      }
    });
    var stageHtml = this.$el
      .html()
      .replace(/board_/g, "cell_")
      .replace(/"board"/g, '"cell unplayed"');
    this.$el.find("board").each(function() {
      $(this).append("<stage>" + stageHtml + "</stage>");
    });
    this.$el.prepend('<div class="description"></div>');
  }

  setupListeners() {
    this.$el.find(".cell").click(this.cellClick);
  }

  cellClick(e) {
    var $el = $(e.delegateTarget);
    if ($el.hasClass("unplayed") && !$el.closest(".board").hasClass("complete") && !$el.closest(".board").hasClass("inactive")) {
      var turn = game.turnClasses[game.turnNumber % 2];
      $el.addClass("taken_" + turn).removeClass("unplayed");
      var index = $el.index() + $el.parent().index() * 3;

      $(".board").removeClass("inactive active");
      if (!$(".board:eq(" + index + ")").hasClass("complete")) {
        $(".board")
          .addClass("inactive")
          .filter(":eq(" + index + ")")
          .removeClass("inactive")
          .addClass("active");
      }
      game.turnNumber++;
      $("body").attr(
        "class",
        "current_turn_" + game.turnClasses[game.turnNumber % 2]
      );
      game.storeGameValues();
      game.checkBoardWinners($el.closest(".board"));
      if (!$(".board").not(".complete,.inactive").length) {
        $(".board").removeClass("inactive active");
      }
      game.updateDescription();
    }
  }
  resize() {
    game.$el.css(
      "font-size",
      ($(window).height()/$(window).width() > 1.2 ? ".9vw" : ".75vh")
    );
  }

  storeGameValues() {
    this.state.boards.x = $(".board")
      .map(function() {
        return $(this).hasClass("taken_x") ? 1 : 0;
      })
      .get()
      .join("");
    this.state.boards.o = $(".board")
      .map(function() {
        return $(this).hasClass("taken_o") ? 1 : 0;
      })
      .get()
      .join("");
    this.state.boards.cells = $(".board")
      .map(function() {
        return {
          x: $(this)
            .find(".cell")
            .map(function() {
              return $(this).hasClass("taken_x") ? 1 : 0;
            })
            .get()
            .join(""),
          o: $(this)
            .find(".cell")
            .map(function() {
              return $(this).hasClass("taken_o") ? 1 : 0;
            })
            .get()
            .join("")
        };
      })
      .get();
  }

  checkBoardWinners($board) {
    $(".board").each(function(i) {
      if ($(this)[0] === $board[0]) {
        game.checkBoard(game.state.boards.cells[i], $board);
      }
    });
  }

  checkBoard(boardVals, $board) {
    var found = false;
    for (var i = 0; i < this.regexes.length; i++) {
      if (boardVals.x.match(this.regexes[i])) {
        $board.addClass("taken_x complete");
        found = true;
      }
      if (boardVals.o.match(this.regexes[i])) {
        $board.addClass("taken_o complete");
        found = true;
      }
      if (found) {
        this.storeGameValues();
        if ($board !== game.$el) {
          this.checkBoard(game.state.boards, game.$el);
        } else {
          setTimeout(function() {$('body').addClass('complete')},300);
        }
        return true;
      }
    }
  }
  
  updateDescription(str) {
    var str = '';
    if (this.$el.find('.inactive').length) {
      str = '<span class="color_{player}">{player}</span>\'s turn to play in the highlighted board';
    } else {
      str = '<span class="color_{player}">{player}</span> has a free play on any board';
    }
    this.$el.find('.description').html(str.replace(/{player}/g,this.turnClasses[this.turnNumber % 2]));
  }
  
  destroy() {
    this.$el.html('');
    delete this;
  }
}

var game = new ticTac($('stage').first());
$(window).resize(game.resize).resize();
$('stage').addClass('hidden');

$('#human').click(function() {
  $('body>*').addClass('hidden');
  $('stage').attr('class','');
  game = new ticTac($('stage').first());
});

$('body').click(function() {
  if ($(this).hasClass('complete')) {
    $('body>*').addClass('hidden');
    $('menu').removeClass('hidden');
    game.destroy();
  }
});