'use strict';

var out = document.querySelector('output');
function log(str) {
  out.innerHTML += `<div>${[].join.call(arguments, ' ')}</div>`;
}

function generateFilledArray(length, val) {
  if( Array.prototype.fill ) {
    return Array(length).fill(val);
  } else {
    var arr = [];
    var i = 0;
    while(i < length) {
      arr.push(val);
      ++i;
    }
    return arr;
  }
}

function leftPad(length, value) {
  return generateFilledArray(length, ' ').join('') + value || '';
}

function assertMultiplyEquals(a, b, c) {
  var result = multiply(a, b);
  log("Assertion: [", a, '*', b, '=', c, ']');
  log(leftPad(a.length + b.length + 19, result), '<b>', result === c, '</b>');
}

function logSum(a, b) {
  log(a, '+', b, '=<b>', addUp(a, b), '</b>');
}

function logProduct(a, b) {
  log(a, '*', b, '=<b>', multiply(a, b), '</b>');
}

function logSumCompare(a, b) {
  log(Number(a), '+', Number(b), '=', Number(a) + Number(b));
  logSum(a, b);
}

function logProductCompare(a, b) {
  log(Number(a), '*', Number(b), '=', Number(a) * Number(b));
  log(a, '*', b, '=<b>', multiply(a, b), '</b>');
}

function addUp() {
    return [].slice.call(arguments).reduce(function(a, b) {
        // @REVIEW: WHY DO i need to convert this to string?
        a = (''+a).split('').reverse();
        b = (''+b).split('').reverse();

        var maxLength = Math.max(a.length, b.length);
        var result = [];
        var carry = generateFilledArray(maxLength, 0);

        for(var i = 0; i < carry.length; ++i) {
           var r = (+(a[i] || 0)) + (+(b[i] || 0)) + (+(carry[i] || 0));
           r = (''+r).split('').reverse();

           result.push(r[0]);

           if(r[1]) {
            carry[i+1] = +r[1];
           }
        }

        return result.reverse().join('');
    }, '0');
}

// Multiply single digits with carry over
function multiplyWithCarry(a, b) {
  return splitCarry(a*b);
}

// Split number to get carry over
// intended for max 2 digit numbers
// [0] : value
// [1] : carry over
function splitCarry(n) {
  return (''+n).split('').reverse();
}

var negRegex = /^\-/;

function testSign(a, b) {
  var na = negRegex.test(a);
  var nb = negRegex.test(b);
  return ((na && nb) || (!na && !nb)) ? '' : '-';
}

function getMultiplicationLines(a, b) {
  // log('carry', '/', 'split', '->', 'value');

  var r = (''+b).replace(negRegex, '').split('').reverse().map(function(multiplier, index) {
    // Keep carry
    var carry = 0;
    // Append 0s to right of number
    var value = generateFilledArray(index, 0);

    (''+a).replace(negRegex, '').split('').reverse().map(function(subject, index, array) {
       // log(' ');
       // log(multiplier, '*', subject, '=', multiplier*subject);
       var split = multiplyWithCarry(multiplier, subject);

       // log(carry, '/', split, '->', '['+value+']');
       var latestValue = +(split[0]) + +(carry);
       // @REVIEW: double check data types, so I don't have to '+' all the time
       value.push(+latestValue);

       carry = split[1] || 0;

       // @REVIEW: too manual
       var latestCarry = splitCarry(latestValue);
       if(latestCarry[1]) {
        carry = latestCarry[1]
        // log("Double Carry: ", latestCarry[1]);
        value.pop();
        // @REVIEW: double check data types, so I don't have to '+' all the time
        value.push(+latestCarry[0]);
       }

       // @REVIEW: too manual
       // If it's the last one, add the carry to the value as well
       if(index === array.length - 1) {
        // @REVIEW: double check data types, so I don't have to '+' all the time
        value.push(+carry);
       }

       // log(carry, '/', split, '->', '['+value+']');
    });

    // Only for logging as `[].reverse` operates in place
    // log("Value: ", value.reduceRight(function(carry, val) {
    //   return carry + val;
    // }, ''));

    return value;
  });

  // log('<hr>');
  // log('[', r.join('], ['), ']');
  // log('<hr>');

  return r;
}

function multiply(a, b) {
  return testSign(a, b) + addUp.apply(null, getMultiplicationLines(a, b).map(function(item) {
    return item.reverse().join('').replace(/^0+/, '');
  }));
}

log('<hr>');

// log('Total: ', multiply('716', '995'));

log('<hr>');

log('Addition');
logSum('9','9');
logSum('999','999');
logSum('12000','21');
logSumCompare('9999912312391239','90999909000012339967890');

log('<hr/>');
log('Multiplication')
logProduct('2', '2');
logProduct('10', '10');
logProduct('999', '9123333');
logProduct('716', '995');
logProductCompare('00009999456999999', '9999999900');

log('<hr/>');
log('Negatives')
assertMultiplyEquals('10', '10', '100');
assertMultiplyEquals('10', '-10', '-100');
assertMultiplyEquals('-10', '10', '-100');
assertMultiplyEquals('-10', '-10', '100');
assertMultiplyEquals('-1123', '123579', '-138779217');
assertMultiplyEquals('1784590', '947381', '1690686658790');
assertMultiplyEquals('-562783917942', '-999787', '562664044967478354');
