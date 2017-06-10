$(function() {
    function getAcronym() {
        $.getJSON("/api/random/", function(acronym) {
            var message = acronym.join(' ');

            $("#homeHeading").text(message).css('color', 'black');;
        });
    };

    setInterval(getAcronym, 3000);
});
