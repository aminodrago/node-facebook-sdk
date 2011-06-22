var Facebook = require('../lib/facebook').Facebook;
var connect = require('connect');
var http = require('http');
var https = require('https');
var url = require('url');


var APP_ID = '117743971608120';
var SECRET = '943716006e74d9b9283d4d5d8ab93204';

var MIGRATED_APP_ID = '174236045938435';
var MIGRATED_SECRET = '0073dce2d95c4a5c2922d1827ea0cca6';

var kExpiredAccessToken = '206492729383450|2.N4RKywNPuHAey7CK56_wmg__.3600.1304560800.1-214707|6Q14AfpYi_XJB26aRQumouzJiGA';
var kValidSignedRequest = '1sxR88U4SW9m6QnSxwCEw_CObqsllXhnpP5j2pxD97c.eyJhbGdvcml0aG0iOiJITUFDLVNIQTI1NiIsImV4cGlyZXMiOjEyODEwNTI4MDAsIm9hdXRoX3Rva2VuIjoiMTE3NzQzOTcxNjA4MTIwfDIuVlNUUWpub3hYVVNYd1RzcDB1U2g5d19fLjg2NDAwLjEyODEwNTI4MDAtMTY3Nzg0NjM4NXx4NURORHBtcy1nMUM0dUJHQVYzSVdRX2pYV0kuIiwidXNlcl9pZCI6IjE2Nzc4NDYzODUifQ';
var kNonTosedSignedRequest = 'c0Ih6vYvauDwncv0n0pndr0hP0mvZaJPQDPt6Z43O0k.eyJhbGdvcml0aG0iOiJITUFDLVNIQTI1NiJ9';

//  public function testConstructor() {
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//    $this->assertEquals($facebook->getAppId(), self::APP_ID,
//                        'Expect the App ID to be set.');
//    $this->assertEquals($facebook->getApiSecret(), self::SECRET,
//                        'Expect the API secret to be set.');
//  }
//
//  public function testConstructorWithFileUpload() {
//    $facebook = new TransientFacebook(array(
//      'appId'      => self::APP_ID,
//      'secret'     => self::SECRET,
//      'fileUpload' => true,
//    ));
//    $this->assertEquals($facebook->getAppId(), self::APP_ID,
//                        'Expect the App ID to be set.');
//    $this->assertEquals($facebook->getApiSecret(), self::SECRET,
//                        'Expect the API secret to be set.');
//    $this->assertTrue($facebook->useFileUploadSupport(),
//                      'Expect file upload support to be on.');
//  }
//
//  public function testSetAppId() {
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//    $facebook->setAppId('dummy');
//    $this->assertEquals($facebook->getAppId(), 'dummy',
//                        'Expect the App ID to be dummy.');
//  }
//
//  public function testSetAPISecret() {
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//    $facebook->setApiSecret('dummy');
//    $this->assertEquals($facebook->getApiSecret(), 'dummy',
//                        'Expect the API secret to be dummy.');
//  }
//
//  public function testSetAccessToken() {
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//
//    $facebook->setAccessToken('saltydog');
//    $this->assertEquals($facebook->getAccessToken(), 'saltydog',
//                        'Expect installed access token to remain \'saltydog\'');
//  }
//
//  public function testSetFileUploadSupport() {
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//    $this->assertFalse($facebook->useFileUploadSupport(),
//                       'Expect file upload support to be off.');
//    $facebook->setFileUploadSupport(true);
//    $this->assertTrue($facebook->useFileUploadSupport(),
//                      'Expect file upload support to be on.');
//  }

[
  {
    path: '/unit-tests.php?one=one&two=two&three=three',
    expect: 'http://www.test.com/unit-tests.php?one=one&two=two&three=three'
  },
  
  // ensure structure of valueless GET params is retained (sometimes
  // an = sign was present, and sometimes it was not)
  // first test when equal signs are present
  {
    path: '/unit-tests.php?one=&two=&three=',
    expect: 'http://www.test.com/unit-tests.php?one=&two=&three='
  },
  
  // now confirm that
  {
    path: '/unit-tests.php?one&two&three',
    expect: 'http://www.test.com/unit-tests.php?one&two&three'
  }
  
].forEach(function (test) {
  
  exports['testGetCurrentURL ' + test.path] = function (assert) {
    var request = {
      path : test.path,
      headers : { host : 'www.test.com' }
    };
    httpServerTest(request, function (req, res) {
      var current_url = req.facebook._getCurrentUrl();
      assert.equal(
        test.expect,
        current_url,
        'getCurrentUrl function is changing the current URL');
      assert.done();
    });
  };
  
});

exports.testGetLoginURL = function (assert) {
  var request = {
    path : '/unit-tests.php',
    headers : { host : 'www.test.com' }
  };
  httpServerTest(request, function (req, res) {
    var login_url = url.parse(req.facebook.getLoginUrl(), true);
    assert.equal('https:',           login_url.protocol);
    assert.equal('www.facebook.com', login_url.host);
    assert.equal('/dialog/oauth',    login_url.pathname);
    assert.equal(APP_ID,             login_url.query.client_id);
    assert.equal('http://www.test.com/unit-tests.php', login_url.query.redirect_uri);
    // we don't know what the state is, but we know it's an md5 and should
    // be 32 characters long.
    assert.equal(32, login_url.query.state.length);
    assert.done();
  });
};

exports.testGetLoginURLWithExtraParams = function (assert) {
  var request = {
    path : '/unit-tests.php',
    headers : { host : 'www.test.com' }
  };
  httpServerTest(request, function (req, res) {
    var extra_params = { scope : 'email, sms',
                         nonsense : 'nonsense'};
    var login_url = url.parse(req.facebook.getLoginUrl(extra_params), true);
    assert.equal('https:',           login_url.protocol);
    assert.equal('www.facebook.com', login_url.host);
    assert.equal('/dialog/oauth',    login_url.pathname);
    var expected_login_params = array_merge(
        { client_id : APP_ID,
          redirect_uri : 'http://www.test.com/unit-tests.php' },
        extra_params
    );
    for (var i in expected_login_params) {
      assert.equal(expected_login_params[i], login_url.query[i]);
    }
    // we don't know what the state is, but we know it's an md5 and should
    // be 32 characters long.
    assert.equal(32, login_url.query.state.length);
    assert.done();
  });
};

//  public function testGetCodeWithValidCSRFState() {
//    $facebook = new FBCode(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//
//    $facebook->setCSRFStateToken();
//    $code = $_REQUEST['code'] = $this->generateMD5HashOfRandomValue();
//    $_REQUEST['state'] = $facebook->getCSRFStateToken();
//    $this->assertEquals($code,
//                        $facebook->publicGetCode(),
//                        'Expect code to be pulled from $_REQUEST[\'code\']');
//  }
//
//  public function testGetCodeWithInvalidCSRFState() {
//    $facebook = new FBCode(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//
//    $facebook->setCSRFStateToken();
//    $code = $_REQUEST['code'] = $this->generateMD5HashOfRandomValue();
//    $_REQUEST['state'] = $facebook->getCSRFStateToken().'forgery!!!';
//    $this->assertFalse($facebook->publicGetCode(),
//                       'Expect getCode to fail, CSRF state should not match.');
//  }
//
//  public function testGetCodeWithMissingCSRFState() {
//    $facebook = new FBCode(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//
//    $code = $_REQUEST['code'] = $this->generateMD5HashOfRandomValue();
//    // intentionally don't set CSRF token at all
//    $this->assertFalse($facebook->publicGetCode(),
//                       'Expect getCode to fail, CSRF state not sent back.');
//
//  }
//
//  public function testGetUserFromSignedRequest() {
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//
//    $_REQUEST['signed_request'] = self::$kValidSignedRequest;
//    $this->assertEquals('1677846385', $facebook->getUser(),
//                        'Failed to get user ID from a valid signed request.');
//  }
//
//  public function testNonUserAccessToken() {
//    $facebook = new FBAccessToken(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//
//    // no cookies, and no request params, so no user or code,
//    // so no user access token (even with cookie support)
//    $this->assertEquals($facebook->publicGetApplicationAccessToken(),
//                        $facebook->getAccessToken(),
//                        'Access token should be that for logged out users.');
//  }
//
//  public function testAPIForLoggedOutUsers() {
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//    $response = $facebook->api(array(
//      'method' => 'fql.query',
//      'query' => 'SELECT name FROM user WHERE uid=4',
//    ));
//    $this->assertEquals(count($response), 1,
//                        'Expect one row back.');
//    $this->assertEquals($response[0]['name'], 'Mark Zuckerberg',
//                        'Expect the name back.');
//  }
//
//  public function testAPIWithBogusAccessToken() {
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//
//    $facebook->setAccessToken('this-is-not-really-an-access-token');
//    // if we don't set an access token and there's no way to
//    // get one, then the FQL query below works beautifully, handing
//    // over Zuck's public data.  But if you specify a bogus access
//    // token as I have right here, then the FQL query should fail.
//    // We could return just Zuck's public data, but that wouldn't
//    // advertise the issue that the access token is at worst broken
//    // and at best expired.
//    try {
//      $response = $facebook->api(array(
//        'method' => 'fql.query',
//        'query' => 'SELECT name FROM profile WHERE id=4',
//      ));
//      $this->fail('Should not get here.');
//    } catch(FacebookApiException $e) {
//      $result = $e->getResult();
//      $this->assertTrue(is_array($result), 'expect a result object');
//      $this->assertEquals('190', $result['error_code'], 'expect code');
//    }
//  }
//
//  public function testAPIGraphPublicData() {
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//
//    $response = $facebook->api('/jerry');
//    $this->assertEquals(
//      $response['id'], '214707', 'should get expected id.');
//  }
//
//  public function testGraphAPIWithBogusAccessToken() {
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//
//    $facebook->setAccessToken('this-is-not-really-an-access-token');
//    try {
//      $response = $facebook->api('/me');
//      $this->fail('Should not get here.');
//    } catch(FacebookApiException $e) {
//      // means the server got the access token and didn't like it
//      $msg = 'OAuthException: Invalid OAuth access token.';
//      $this->assertEquals($msg, (string) $e,
//                          'Expect the invalid OAuth token message.');
//    }
//  }
//
//  public function testGraphAPIWithExpiredAccessToken() {
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//
//    $facebook->setAccessToken(self::$kExpiredAccessToken);
//    try {
//      $response = $facebook->api('/me');
//      $this->fail('Should not get here.');
//    } catch(FacebookApiException $e) {
//      // means the server got the access token and didn't like it
//      $error_msg_start = 'OAuthException: Error validating access token:';
//      $this->assertTrue(strpos((string) $e, $error_msg_start) === 0,
//                        'Expect the token validation error message.');
//    }
//  }
//
//  public function testGraphAPIMethod() {
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//
//    try {
//      // naitik being bold about deleting his entire record....
//      // let's hope this never actually passes.
//      $response = $facebook->api('/naitik', $method = 'DELETE');
//      $this->fail('Should not get here.');
//    } catch(FacebookApiException $e) {
//      // ProfileDelete means the server understood the DELETE
//      $msg =
//        'OAuthException: An access token is required to request this resource.';
//      $this->assertEquals($msg, (string) $e,
//                          'Expect the invalid session message.');
//    }
//  }
//
//  public function testGraphAPIOAuthSpecError() {
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::MIGRATED_APP_ID,
//      'secret' => self::MIGRATED_SECRET,
//    ));
//
//    try {
//      $response = $facebook->api('/me', array(
//        'client_id' => self::MIGRATED_APP_ID));
//
//      $this->fail('Should not get here.');
//    } catch(FacebookApiException $e) {
//      // means the server got the access token
//      $msg = 'invalid_request: An active access token must be used '.
//             'to query information about the current user.';
//      $this->assertEquals($msg, (string) $e,
//                          'Expect the invalid session message.');
//    }
//  }
//
//  public function testGraphAPIMethodOAuthSpecError() {
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::MIGRATED_APP_ID,
//      'secret' => self::MIGRATED_SECRET,
//    ));
//
//    try {
//      $response = $facebook->api('/daaku.shah', 'DELETE', array(
//        'client_id' => self::MIGRATED_APP_ID));
//      $this->fail('Should not get here.');
//    } catch(FacebookApiException $e) {
//      $this->assertEquals(strpos($e, 'invalid_request'), 0);
//    }
//  }
//
//  public function testCurlFailure() {
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//
//    if (!defined('CURLOPT_TIMEOUT_MS')) {
//      // can't test it if we don't have millisecond timeouts
//      return;
//    }
//
//    $exception = null;
//    try {
//      // we dont expect facebook will ever return in 1ms
//      Facebook::$CURL_OPTS[CURLOPT_TIMEOUT_MS] = 50;
//      $facebook->api('/naitik');
//    } catch(FacebookApiException $e) {
//      $exception = $e;
//    }
//    unset(Facebook::$CURL_OPTS[CURLOPT_TIMEOUT_MS]);
//    if (!$exception) {
//      $this->fail('no exception was thrown on timeout.');
//    }
//
//    $this->assertEquals(
//      CURLE_OPERATION_TIMEOUTED, $exception->getCode(), 'expect timeout');
//    $this->assertEquals('CurlException', $exception->getType(), 'expect type');
//  }
//
//  public function testGraphAPIWithOnlyParams() {
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//
//    $response = $facebook->api('/331218348435/feed',
//      array('limit' => 1, 'access_token' => ''));
//    $this->assertEquals(1, count($response['data']), 'should get one entry');
//    $this->assertTrue(
//      strpos($response['paging']['next'], 'limit=1') !== false,
//      'expect the same limit back in the paging urls'
//    );
//  }
//
//  public function testLoginURLDefaults() {
//    $_SERVER['HTTP_HOST'] = 'fbrell.com';
//    $_SERVER['REQUEST_URI'] = '/examples';
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//    $encodedUrl = rawurlencode('http://fbrell.com/examples');
//    $this->assertNotNull(strpos($facebook->getLoginUrl(), $encodedUrl),
//                         'Expect the current url to exist.');
//  }
//
//  public function testLoginURLDefaultsDropStateQueryParam() {
//    $_SERVER['HTTP_HOST'] = 'fbrell.com';
//    $_SERVER['REQUEST_URI'] = '/examples?state=xx42xx';
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//    $expectEncodedUrl = rawurlencode('http://fbrell.com/examples');
//    $this->assertTrue(strpos($facebook->getLoginUrl(), $expectEncodedUrl) > -1,
//                      'Expect the current url to exist.');
//    $this->assertFalse(strpos($facebook->getLoginUrl(), 'xx42xx'),
//                       'Expect the session param to be dropped.');
//  }
//
//  public function testLoginURLDefaultsDropCodeQueryParam() {
//    $_SERVER['HTTP_HOST'] = 'fbrell.com';
//    $_SERVER['REQUEST_URI'] = '/examples?code=xx42xx';
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//    $expectEncodedUrl = rawurlencode('http://fbrell.com/examples');
//    $this->assertTrue(strpos($facebook->getLoginUrl(), $expectEncodedUrl) > -1,
//                      'Expect the current url to exist.');
//    $this->assertFalse(strpos($facebook->getLoginUrl(), 'xx42xx'),
//                       'Expect the session param to be dropped.');
//  }
//
//  public function testLoginURLDefaultsDropSignedRequestParamButNotOthers() {
//    $_SERVER['HTTP_HOST'] = 'fbrell.com';
//    $_SERVER['REQUEST_URI'] =
//      '/examples?signed_request=xx42xx&do_not_drop=xx43xx';
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//    $expectEncodedUrl = rawurlencode('http://fbrell.com/examples');
//    $this->assertFalse(strpos($facebook->getLoginUrl(), 'xx42xx'),
//                       'Expect the session param to be dropped.');
//    $this->assertTrue(strpos($facebook->getLoginUrl(), 'xx43xx') > -1,
//                      'Expect the do_not_drop param to exist.');
//  }
//
//  public function testLoginURLCustomNext() {
//    $_SERVER['HTTP_HOST'] = 'fbrell.com';
//    $_SERVER['REQUEST_URI'] = '/examples';
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//    $next = 'http://fbrell.com/custom';
//    $loginUrl = $facebook->getLoginUrl(array(
//      'redirect_uri' => $next,
//      'cancel_url' => $next
//    ));
//    $currentEncodedUrl = rawurlencode('http://fbrell.com/examples');
//    $expectedEncodedUrl = rawurlencode($next);
//    $this->assertNotNull(strpos($loginUrl, $expectedEncodedUrl),
//                         'Expect the custom url to exist.');
//    $this->assertFalse(strpos($loginUrl, $currentEncodedUrl),
//                      'Expect the current url to not exist.');
//  }
//
//  public function testLogoutURLDefaults() {
//    $_SERVER['HTTP_HOST'] = 'fbrell.com';
//    $_SERVER['REQUEST_URI'] = '/examples';
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//    $encodedUrl = rawurlencode('http://fbrell.com/examples');
//    $this->assertNotNull(strpos($facebook->getLogoutUrl(), $encodedUrl),
//                         'Expect the current url to exist.');
//  }
//
//  public function testLoginStatusURLDefaults() {
//    $_SERVER['HTTP_HOST'] = 'fbrell.com';
//    $_SERVER['REQUEST_URI'] = '/examples';
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//    $encodedUrl = rawurlencode('http://fbrell.com/examples');
//    $this->assertNotNull(strpos($facebook->getLoginStatusUrl(), $encodedUrl),
//                         'Expect the current url to exist.');
//  }
//
//  public function testLoginStatusURLCustom() {
//    $_SERVER['HTTP_HOST'] = 'fbrell.com';
//    $_SERVER['REQUEST_URI'] = '/examples';
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//    $encodedUrl1 = rawurlencode('http://fbrell.com/examples');
//    $okUrl = 'http://fbrell.com/here1';
//    $encodedUrl2 = rawurlencode($okUrl);
//    $loginStatusUrl = $facebook->getLoginStatusUrl(array(
//      'ok_session' => $okUrl,
//    ));
//    $this->assertNotNull(strpos($loginStatusUrl, $encodedUrl1),
//                         'Expect the current url to exist.');
//    $this->assertNotNull(strpos($loginStatusUrl, $encodedUrl2),
//                         'Expect the custom url to exist.');
//  }
//
//  public function testNonDefaultPort() {
//    $_SERVER['HTTP_HOST'] = 'fbrell.com:8080';
//    $_SERVER['REQUEST_URI'] = '/examples';
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//    $encodedUrl = rawurlencode('http://fbrell.com:8080/examples');
//    $this->assertNotNull(strpos($facebook->getLoginUrl(), $encodedUrl),
//                         'Expect the current url to exist.');
//  }
//
//  public function testSecureCurrentUrl() {
//    $_SERVER['HTTP_HOST'] = 'fbrell.com';
//    $_SERVER['REQUEST_URI'] = '/examples';
//    $_SERVER['HTTPS'] = 'on';
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//    $encodedUrl = rawurlencode('https://fbrell.com/examples');
//    $this->assertNotNull(strpos($facebook->getLoginUrl(), $encodedUrl),
//                         'Expect the current url to exist.');
//  }
//
//  public function testSecureCurrentUrlWithNonDefaultPort() {
//    $_SERVER['HTTP_HOST'] = 'fbrell.com:8080';
//    $_SERVER['REQUEST_URI'] = '/examples';
//    $_SERVER['HTTPS'] = 'on';
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//    $encodedUrl = rawurlencode('https://fbrell.com:8080/examples');
//    $this->assertNotNull(strpos($facebook->getLoginUrl(), $encodedUrl),
//                         'Expect the current url to exist.');
//  }
//
//  public function testAppSecretCall() {
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET,
//    ));
//
//    $proper_exception_thrown = false;
//    try {
//      $response = $facebook->api('/' . self::APP_ID . '/insights');
//      $this->fail('Desktop applications need a user token for insights.');
//    } catch (FacebookApiException $e) {
//      $proper_exception_thrown =
//        strpos($e->getMessage(),
//               'Requires session when calling from a desktop app') !== false;
//    } catch (Exception $e) {}
//
//    $this->assertTrue($proper_exception_thrown,
//                      'Incorrect exception type thrown when trying to gain '.
//                      'insights for desktop app without a user access token.');
//  }
//
//  public function testBase64UrlEncode() {
//    $input = 'Facebook rocks';
//    $output = 'RmFjZWJvb2sgcm9ja3M';
//
//    $this->assertEquals(FBPublic::publicBase64UrlDecode($output), $input);
//  }
//
//  public function testSignedToken() {
//    $facebook = new FBPublic(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET
//    ));
//    $payload = $facebook->publicParseSignedRequest(self::$kValidSignedRequest);
//    $this->assertNotNull($payload, 'Expected token to parse');
//    $this->assertEquals($facebook->getSignedRequest(), null);
//    $_REQUEST['signed_request'] = self::$kValidSignedRequest;
//    $this->assertEquals($facebook->getSignedRequest(), $payload);
//  }
//
//  public function testNonTossedSignedtoken() {
//    $facebook = new FBPublic(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET
//    ));
//    $payload = $facebook->publicParseSignedRequest(
//      self::$kNonTosedSignedRequest);
//    $this->assertNotNull($payload, 'Expected token to parse');
//    $this->assertNull($facebook->getSignedRequest());
//    $_REQUEST['signed_request'] = self::$kNonTosedSignedRequest;
//    $this->assertEquals($facebook->getSignedRequest(),
//      array('algorithm' => 'HMAC-SHA256'));
//  }
//
//  public function testBundledCACert() {
//    $facebook = new TransientFacebook(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET
//    ));
//
//      // use the bundled cert from the start
//    Facebook::$CURL_OPTS[CURLOPT_CAINFO] =
//      dirname(__FILE__) . '/../src/fb_ca_chain_bundle.crt';
//    $response = $facebook->api('/naitik');
//
//    unset(Facebook::$CURL_OPTS[CURLOPT_CAINFO]);
//    $this->assertEquals(
//      $response['id'], '5526183', 'should get expected id.');
//  }
//
//  public function testVideoUpload() {
//    $facebook = new FBRecordURL(array(
//      'appId'  => self::APP_ID,
//      'secret' => self::SECRET
//    ));
//
//    $facebook->api(array('method' => 'video.upload'));
//    $this->assertContains('//api-video.', $facebook->getRequestedURL(),
//                          'video.upload should go against api-video');
//  }
//
//  public function testGetUserAndAccessTokenFromSession() {
//    $facebook = new PersistentFBPublic(array(
//                                         'appId'  => self::APP_ID,
//                                         'secret' => self::SECRET
//                                       ));
//
//    $facebook->publicSetPersistentData('access_token',
//                                       self::$kExpiredAccessToken);
//    $facebook->publicSetPersistentData('user_id', 12345);
//    $this->assertEquals(self::$kExpiredAccessToken,
//                        $facebook->getAccessToken(),
//                        'Get access token from persistent store.');
//    $this->assertEquals('12345',
//                        $facebook->getUser(),
//                        'Get user id from persistent store.');
//  }
//
//  public function testGetUserAndAccessTokenFromSignedRequestNotSession() {
//    $facebook = new PersistentFBPublic(array(
//                                         'appId'  => self::APP_ID,
//                                         'secret' => self::SECRET
//                                       ));
//
//    $_REQUEST['signed_request'] = self::$kValidSignedRequest;
//    $facebook->publicSetPersistentData('user_id', 41572);
//    $facebook->publicSetPersistentData('access_token',
//                                       self::$kExpiredAccessToken);
//    $this->assertNotEquals('41572', $facebook->getUser(),
//                           'Got user from session instead of signed request.');
//    $this->assertEquals('1677846385', $facebook->getUser(),
//                        'Failed to get correct user ID from signed request.');
//    $this->assertNotEquals(
//      self::$kExpiredAccessToken,
//      $facebook->getAccessToken(),
//      'Got access token from session instead of signed request.');
//    $this->assertNotEmpty(
//      $facebook->getAccessToken(),
//      'Failed to extract an access token from the signed request.');
//  }
//
//  public function testGetUserWithoutCodeOrSignedRequestOrSession() {
//    $facebook = new PersistentFBPublic(array(
//                                         'appId'  => self::APP_ID,
//                                         'secret' => self::SECRET
//                                       ));
//
//    // deliberately leave $_REQUEST and _$SESSION empty
//    $this->assertEmpty($_REQUEST,
//                       'GET, POST, and COOKIE params exist even though '.
//                       'they should.  Test cannot succeed unless all of '.
//                       '$_REQUEST is empty.');
//    $this->assertEmpty($_SESSION,
//                       'Session is carrying state and should not be.');
//    $this->assertEmpty($facebook->getUser(),
//                       'Got a user id, even without a signed request, '.
//                       'access token, or session variable.');
//    $this->assertEmpty($_SESSION,
//                       'Session superglobal incorrectly populated by getUser.');
//  }
//
//  protected function generateMD5HashOfRandomValue() {
//    return md5(uniqid(mt_rand(), true));
//  }
//
//  protected function setUp() {
//    parent::setUp();
//  }
//
//  protected function tearDown() {
//    $this->clearSuperGlobals();
//    parent::tearDown();
//  }
//
//  protected function clearSuperGlobals() {
//    unset($_SERVER['HTTPS']);
//    unset($_SERVER['HTTP_HOST']);
//    unset($_SERVER['REQUEST_URI']);
//    $_SESSION = array();
//    $_COOKIE = array();
//    $_REQUEST = array();
//    $_POST = array();
//    $_GET = array();
//    if (session_id()) {
//      session_destroy();
//    }
//  }
//
//  /**
//   * Checks that the correct args are a subset of the returned obj
//   * @param  array $correct The correct array values
//   * @param  array $actual  The values in practice
//   * @param  string $message to be shown on failure
//   */
//  protected function assertIsSubset($correct, $actual, $msg='') {
//    foreach ($correct as $key => $value) {
//      $actual_value = $actual[$key];
//      $newMsg = (strlen($msg) ? ($msg.' ') : '').'Key: '.$key;
//      $this->assertEquals($value, $actual_value, $newMsg);
//    }
//  }
//}
//
//class TransientFacebook extends BaseFacebook {
//  protected function setPersistentData($key, $value) {}
//  protected function getPersistentData($key, $default = false) {
//    return $default;
//  }
//  protected function clearPersistentData($key) {}
//  protected function clearAllPersistentData() {}
//}
//
//class FBRecordURL extends TransientFacebook {
//  private $url;
//
//  protected function _oauthRequest($url, $params) {
//    $this->url = $url;
//  }
//
//  public function getRequestedURL() {
//    return $this->url;
//  }
//}
//
//class FBPublic extends TransientFacebook {
//  public static function publicBase64UrlDecode($input) {
//    return self::base64UrlDecode($input);
//  }
//  public function publicParseSignedRequest($input) {
//    return $this->parseSignedRequest($input);
//  }
//}
//
//class PersistentFBPublic extends Facebook {
//  public function publicParseSignedRequest($input) {
//    return $this->parseSignedRequest($input);
//  }
//
//  public function publicSetPersistentData($key, $value) {
//    $this->setPersistentData($key, $value);
//  }
//}
//
//class FBCode extends Facebook {
//  public function publicGetCode() {
//    return $this->getCode();
//  }
//
//  public function setCSRFStateToken() {
//    $this->establishCSRFTokenState();
//  }
//
//  public function getCSRFStateToken() {
//    return $this->getPersistentData('state');
//  }
//}
//
//class FBAccessToken extends TransientFacebook {
//  public function publicGetApplicationAccessToken() {
//    return $this->getApplicationAccessToken();
//  }
//}
//
//class FBGetCurrentURLFacebook extends TransientFacebook {
//  public function publicGetCurrentUrl() {
//    return $this->getCurrentUrl();
//  }
//}

/**
 * Creates an http server using the 'test' handler function,
 * makes a request to the server using the options object,
 * and uses the 'result' handler function for testing the server response.
 */
function httpServerTest(options, test) {
  var transport = options.https ? https : http;
  
  options.host = 'localhost';
  options.port = 8889;
  options.path = options.path || '/';
  
  if (options.https) {
    var server = connect({
      key: fs.readFileSync(__dirname + '/test_key.pem'),
      cert: fs.readFileSync(__dirname + '/test_cert.pem')
    });
  } else {
    var server = connect();
  }
  
  server.use(connect.cookieParser());
  server.use(connect.bodyParser());
  server.use(Facebook({
    appId  : APP_ID,
    secret : SECRET
  }));
  
  server.use(function(req, res, next) {
    test(req, res);
    res.end();
    server.close();
  });
  
  server.listen(options.port, function() {
    var request = transport.request(options /*, response */ );
    if (options.post) {
      request.removeHeader('post');
      var post_data = querystring.stringify(options.post);
      request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
      request.setHeader('Content-Length', post_data.length);
      request.write(post_data);
    }
    request.end();
  });
}

// TODO : de-duplicate (it's in facebook.js too)
function array_merge(target) {
  for (var i = 1; i < arguments.length; i++) {
    var uber = arguments[i];
    for (var j in uber) {
      target[j] = uber[j];
    }
  }
  return target;
}
