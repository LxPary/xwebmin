function
getCookie (cookieName)
{
  var cookieJar = document.cookie.split ("; ");
  for (var x = 0; x < cookieJar.length; x++)
    {
      var oneCookie = cookieJar[x].split ("=");
      if (oneCookie[0] == escape (cookieName))
	{
	  return unescape (oneCookie[1]);
	}
    }
  return null;
}

function
setCookie (cookieName, cookieValue, lifeTime, path, domain, isSecure)
{
  if (!cookieName)
    {
      return false;
    }
  if (lifeTime == "delete")
    {
      lifeTime = -10;
    }
  document.cookie =
    escape (cookieName) + "=" + escape (cookieValue) +
    (lifeTime ? ";expires=" +
     (new Date ((new Date ()).getTime () + (1000 * lifeTime))).
     toGMTString () : "") + (path ? ";path=" + path : "") +
    (domain ? ";domain=" + domain : "") + (isSecure ? ";secure" : "");
  if (lifeTime < 0)
    {
      if (typeof (getCookie (cookieName)) == "string")
	{
	  return false;
	}
      return true;
    }
  if (typeof (getCookie (cookieName)) == "string")
    {
      return true;
    }
  return false;
}

function
deleteCookie (cookieName)
{
  setCookie (cookieName, "", "delete");
}
