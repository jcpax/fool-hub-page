$(function(){
  //create main divs
  const app = document.getElementById('root');//grab root
  const search = document.createElement('div');
  const container = document.createElement('div');
  container.setAttribute('class', 'container');
  search.setAttribute('class', 'search');
  app.appendChild(search);
  app.appendChild(container);

    //AJAX call Article API
    $.ajax({
      type: 'GET',
      url: 'http://127.0.0.1:8000/api/articles',
      success: function(data){
        //setting bureau and exchange dropdown array
        var bureau_dropdown = [];
        var exchange_dropdown = [];

        //unorganized data
        var articles_unsorted = data.results;
          function custom_sort(a, b) {
            return new Date(a.modified).getTime() - new Date(b.modified).getTime();
          }

        //organize data by date
        var articles = articles_unsorted.sort(custom_sort);

        //create each article 
        $.each(articles, function(i, articles) {
          //create article
          const article = document.createElement('article');
            article.setAttribute('class', 'card');

          //create dropdown filters
          var bureau = articles.bureau.name;
            bureau_dropdown.push(bureau);
            article.setAttribute('data-bureau', bureau);

          //create instrument exchange filters
          var instruments = articles.instruments;
            for (var i = instruments.length - 1; i >= 0; i--) {
              var exchange = instruments[i].exchange;
            }
            exchange_dropdown.push(exchange);
            article.setAttribute('data-exchange', exchange);

          //grab images
          const img = document.createElement('div');
            var myImage = new Image(500, 300); //set image size
            var images = articles.images; //pulls in image array
              for (var i = images.length - 1; i >= 0; i--) {
                //grabs url
                var image = images[i].url; 
              }
            //set src for image and append
            myImage.src = image;
            img.appendChild(myImage);
            img.className = 'article-img';

          //grab title
          const title = document.createElement('h3');
            //pull in link
            links = articles.links.self;
            //pull in headline
            headline = articles.headline;
            //create title link
            var a = document.createElement( 'a' );
            $(a).append('<a href="' + links + '">' + headline + '</a>');
            title.append(a);

          //grab authoring
          const authoring = document.createElement('p');
            //pulling in date and shortening it
            var long_date = articles.publish_at;
            var date = long_date.substring(0,10);
            //pulling in author
            var authors = articles.authors;
              for (var i = authors.length - 1; i >= 0; i--) {
                var name = authors[i].last_name;
              }
            authoring.textContent = date + ' | ' + name;

          //grab description
          const desc = document.createElement('p');
            articles.description = articles.promo;
            var rex = /(<([^>]+)>)/ig;
            articles.body = articles.description.replace(rex , "");
            desc.textContent= articles.body;

          //append consts to article
            const info = document.createElement('div');
            info.className = 'article-info';
            info.appendChild(title);
            info.appendChild(authoring);
            info.appendChild(desc);

          //adds child elements to each card
          container.appendChild(article);
          article.appendChild(img);
          article.appendChild(info);

        });//end of each function

        //hide all but first 5 items
        var counter = 0;
        $('.card').each(function(i) {
           if (i == 0) {counter = 1;
           } else {counter++;
           }if (counter > 5) {$(this).addClass('hidden');}
        });
        //read more button
        $('#more').click(function(){
          $(".card").removeClass("hidden");
          $('#more').hide();
        });

        //remove repeat items from dropdown list
        let bureau_items = [...new Set(bureau_dropdown)];
        //sort remaining items into options
        var bureau_options = '';
        const bureau_search = document.createElement('select');
        //create a filter all option
        $(bureau_search).append('<option data-bureau="000" selected>All</option>');
        //for each term create an option
        for (var i=0;i<bureau_items.length;i++){
        bureau_options += '<option data-bureau="'+bureau_items[i] + '">' +bureau_items[i] + '</option>';
        }
        //remove repeat items from dropdown list
        let exchange_items = [...new Set(exchange_dropdown)];
        //sort remaining items into options
        var exchange_options = '';
        const exchange_search = document.createElement('select');
        //create a filter all options
        $(exchange_search).append('<option data-exchange="000" selected>All</option>');
        //for each term create an option
        for (var i=0;i<exchange_items.length;i++){
        exchange_options += '<option data-bureau="'+exchange_items[i] + '">' +exchange_items[i] + '</option>';
        }

        //add dropdown filter to app
        $(bureau_search).append(bureau_options);
          bureau_search.setAttribute('class', 'bureau');
        search.appendChild(bureau_search);
        //add dropdown filter to app
        $(exchange_search).append(exchange_options);
          exchange_search.setAttribute('class', 'exchange');
        search.appendChild(exchange_search);

        //create a 'no article found' text area
        const article_none = document.createElement('h4');
          article_none.setAttribute('id', 'article_none');
          article_none.append('Sorry, no articles found');
          search.appendChild(article_none);

        //search function
        $('#article_none').hide();//hide none found text
        //run on dropdown change
        $("select").change(function() {
          $('.card').removeClass('hidden');
          //set values
          var region = $('select.bureau').val(),
          role = $('select.exchange').val();
          //find card that matches values
          $('.container').find('.card')
            .hide()
            var filtered = $('.card').filter(function() {
              $('#article_none').hide();//hide none found text

              if(region !== "all" && $(this).attr('data-bureau') === region){
                return false;
              }
              if(role !== "all" && $(this).attr('data-exchange') === role){
                return false;
              }
            return true;
          })
          filtered.show();

          if (filtered.length == 0) {
            $('#article_none').show();
          }
        });

      },//end success
      error: function(){
        const errorMessage = document.createElement('H2');
        errorMessage.textContent = `Sorry This Section is Not Working`;
        app.appendChild(errorMessage);
      }
    });
});