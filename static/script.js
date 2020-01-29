$(function(){
  //create main divs
  const app = document.getElementById('root');//grab root
  const search = document.createElement('div');
  const container = document.createElement('div');
  container.setAttribute('class', 'container');
  search.setAttribute('class', 'search');
  app.appendChild(search);
  app.appendChild(container);

  //setting bureau and exchange dropdown array
  var bureau_dropdown = [];
  var exchange_dropdown = [];
  var name_symbol_dropdown = []
  
    //AJAX call Instruments API
    $.ajax({
      type: 'GET',
      url: 'http://127.0.0.1:8000/api/instruments',
      success: function(data){
        for (var i = data.length - 1; i >= 0; i--) {
          var compName = data[i].CompanyName;
          var compSymbol = data[i].Symbol;
          var allExchanges = data[i].Exchange;
          //add values to dropdowns
          exchange_dropdown.push(allExchanges);
          name_symbol_dropdown.push(compName + ' - ' + compSymbol);
        }
      }
    });
    //AJAX call Article API
    $.ajax({
      type: 'GET',
      url: 'http://127.0.0.1:8000/api/articles',
      success: function(data){
        
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
            article.setAttribute('data-exchange', exchange);

          //create instrument identity filters
          var instruments = articles.instruments;
          for (var i = instruments.length - 1; i >= 0; i--) {
            //company_name + symbol
            var compName_each = instruments[i].company_name;
            var symbol_name = instruments[i].symbol;
          }
          
          article.setAttribute('data-identity', compName_each + ' - ' + symbol_name);
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
          bureau_search.setAttribute('id', 'bureau_filter');
        //create a filter all option
        $(bureau_search).append('<option data-bureau="000" selected>---</option>');
        //for each term create an option
        for (var i=0;i<bureau_items.length;i++){
        bureau_options += '<option data-bureau="'+bureau_items[i] + '">' +bureau_items[i] + '</option>';
        }
        //remove repeat items from dropdown list
        let exchange_items = [...new Set(exchange_dropdown)];
        //sort remaining items into options
        var exchange_options = '';
        const exchange_search = document.createElement('select');
        exchange_search.setAttribute('id', 'exchange-filter');
        //create a filter all options
        $(exchange_search).append('<option data-exchange="000" selected>---</option>');
        //for each term create an option
        for (var i=0;i<exchange_items.length;i++){
        exchange_options += '<option data-bureau="'+exchange_items[i] + '">' +exchange_items[i] + '</option>';
        }
        //remove repeat items from dropdown list
        let identity_items = [...new Set(name_symbol_dropdown)];
        //sort remaining items into options
        var identity_options = '';
        const identity_search = document.createElement('select');
        identity_search.setAttribute('id', 'identity-filter');
        //create a filter all options
        $(identity_search).append('<option data-exchange="000" selected>---</option>');
        //for each term create an option
        for (var i=0;i<identity_items.length;i++){
        identity_options += '<option data-identity="'+identity_items[i] + '">' +identity_items[i] + '</option>';
        }
        //add dropdown filter to app
        $(bureau_search).append(bureau_options);
          bureau_search.setAttribute('class', 'bureau');
        search.appendChild(bureau_search);
        //add dropdown filter to app
        $(exchange_search).append(exchange_options);
          exchange_search.setAttribute('class', 'exchange');
        search.appendChild(exchange_search);
        //add dropdown filter to app
        $(identity_search).append(identity_options);
          identity_search.setAttribute('class', 'identity');
        search.appendChild(identity_search);
        //create filters for Search Function
          var filters = {
          bureau: null,
          exchange: null,
          identity: null
        };
        //update filters
        function updateFilters() {
          $("article")
            .hide()
            .filter(function() {
            var self = $(this),
                result = true;
            Object.keys(filters).forEach(function(filter) {
              if (
                filters[filter] &&
                filters[filter] != "None" &&
                filters[filter] != "Any"
              ) {
                result = result && filters[filter] === self.data(filter);
              }
            });
            return result;
          })
            .show();
        }
        //change filter
        function changeFilter(filterName) {
          $(".card").removeClass("hidden");
          $('#more').hide();
          filters[filterName] = this.value;
          updateFilters();
        }
        // Assigned bureau Dropdown Filter
        $("#bureau_filter").on("change", function() {
          changeFilter.call(this, "bureau");
        });
        // Task Exchange Dropdown Filter
        $("#exchange-filter").on("change", function() {
          changeFilter.call(this, "exchange");
        });
        // Task Exchange Dropdown Filter
        $("#identity-filter").on("change", function() {
          changeFilter.call(this, "identity");
        });
        //create reset button for filters
        const reset = document.createElement('button');
          reset.textContent= 'Reset';
          reset.setAttribute('class', 'button');
          reset.setAttribute('id', 'reset');
          search.appendChild(reset);
        $("#reset").click(function(){
          $(".card").show();
          document.getElementById('bureau_filter').value = '---';
          document.getElementById('exchange-filter').value = '---';
          document.getElementById('identity-filter').value = '---';
        });
      },
      error: function(){
        //create error message
        const errorMessage = document.createElement('H2');
        errorMessage.textContent = `Sorry This Section is Not Working`;
        app.appendChild(errorMessage);
      }
    });
});
