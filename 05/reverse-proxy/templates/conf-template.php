
<?php
    $ip_static = getenv('STATIC_APP');
    $ip_dynamic = getenv('DYNAMIC_APP');
?>

<VirtualHost *:80>

ServerName truanisei.res.ch

ProxyPass '/api/random/' 'http://<?php print($ip_dynamic) ?>:3000/api/random/'
ProxyPassReverse '/api/random/' 'http://<?php print($ip_dynamic) ?>:3000/api/random/'


ProxyPass '/' 'http://<?php print($ip_static) ?>:80/'
ProxyPassReverse '/' 'http://<?php print($ip_static) ?>:80/'


</VirtualHost>
