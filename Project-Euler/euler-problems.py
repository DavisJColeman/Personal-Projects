import math

def sum_of_multiples_of_3_or_5():
    counter = 0
    sum = 0
    while (counter < 1000):
        if (counter % 3 == 0):
            sum += counter
        elif (counter % 5 == 0):
            sum += counter
        counter += 1
    return sum

def sum_of_even_fibonacci_numbers():
    currentFibonacciNumber = 1
    previousFibonacciNumber = 0
    sum = 0
    while (currentFibonacciNumber < 4000000):
        if (currentFibonacciNumber % 2 == 0):
            sum += currentFibonacciNumber
        temp = currentFibonacciNumber
        currentFibonacciNumber += previousFibonacciNumber
        previousFibonacciNumber = temp
    return sum

"""NOT MY SOLUTION"""
def get_largest_prime_factor(num):
    divisor = 2
    while num % divisor != 0:
        divisor += 1
        if divisor == num:
            return num
    newNum = num / divisor
    return get_largest_prime_factor(newNum)

"""
A palindromic number reads the same both ways. The largest palindrome 
made from the product of two 2-digit numbers is 9009 = 91 x 99.

Find the largest palindrome made from the product of two 3-digit numbers.
"""

def is_palindrome(num):
    string = str(num)
    slicer = slice(0, len(string))
    stringArray = string[slicer]
    for i in range(0, len(stringArray)):
        if stringArray[i] != stringArray[len(stringArray) - i - 1]:
            return False
    return True


def largest_palindrome_product():
    palindromes = []
    palindromeInfo = []
    i = 999
    while i > 99:
        j = i
        while j > 99:
            product = i * j
            if is_palindrome(product):
                palindromeInfo.append([product, i, j])
                palindromes.append(product)
            j -= 1
        i -= 1
    largestPalindrome = max(palindromes)
    largestPalindromeIndex = palindromes.index(largestPalindrome)
    return palindromeInfo[largestPalindromeIndex]

def is_multiple(num):
    for i in range(1, 20):
        if num % i != 0:
            return False
    return True

def smallest_multiple():
    smallestMultiple = 20
    numberIsMultiple = is_multiple(smallestMultiple)
    while (not numberIsMultiple):
        smallestMultiple += 20
        numberIsMultiple = is_multiple(smallestMultiple)
    return smallestMultiple

def sum_square_difference():
    sumOfSquares = sum(i ** 2 for i in range(1, 101))
    squareOfSums = (sum(range(1, 101))) ** 2
    return squareOfSums - sumOfSquares

'''
def number_is_prime(num, primes):
    upperLimit = math.ceil(num ** 0.5)
    for divisor in primes:
        if divisor > upperLimit or divisor == 0:
            break
        if num % divisor == 0:
            return False
    return True

def ten_thousand_and_first_prime():
    listOfPrimes = [0]*10001 # initialize an array of size 10001
    listOfPrimes[0] = 2
    listOfPrimes[1] = 3
    listOfPrimes[2] = 5
    listOfPrimes[3] = 7
    listOfPrimes[4] = 11
    listOfPrimes[5] = 13
    for i in range(0, 10001):
        if i > 5:
            currentPrime = listOfPrimes[i - 1] + 2
            isPrime = number_is_prime(currentPrime, listOfPrimes)
            while not isPrime:
                currentPrime + 2
                isPrime = number_is_prime(currentPrime, listOfPrimes)
            listOfPrimes[i] = currentPrime
    return listOfPrimes[-1]
'''

"""NOT MY SOLUTION"""
def primes(n): # function which computes the nth prime number given input number n
    primes = [2] # initialize list tracking all primes up to and including the nth prime number
    attempt = 3 # initialize the value of the current attempt at computing the next largest prime number
    while len(primes) < n: # while the size of the list of prime numbers is less than n (and therefore does not contain the nth prime number)
        if all(attempt % prime !=0 for prime in primes): # if no prime number in the list of primes is a factor of the current attempt number
            primes.append(attempt) # then the number is prime, and therefore can be appended to the list of prime numbers
        attempt += 2 # iterate the while loop to the next odd number greater than the current prime number (2 is the only even prime number)
    return primes[-1] # after the while loop ends, return the nth prime number, which is the last element in the list of primes

def largest_product_in_series(number, adjacentDigitsCount):
    """
    - iterate over every subset of adjacent digits of size adjacentDigitCount within the number
    - at every iteration, compute the product of every digit within that subset of digits
    - keep track of the largest product which has been computed thus far, as well as that subset of digits
    - end the iteration when the last subset of digits has been reached, and we are too close to the end of the number to get a fully sized subset of sigits
    - return a list containing the subset of digits with the greatest product, and that product
    """
    characters = str(number)
    product = 1  
    productDigits = characters[0:adjacentDigitsCount]
    for i in range(0, (len(str(number)) - adjacentDigitsCount)):
        curDigits = [int(char) for char in characters[i:i+adjacentDigitsCount]]
        curProduct = 1
        for digit in curDigits:
            curProduct = digit * curProduct
        if curProduct > product: 
            product = curProduct
            productDigits = curDigits
    return product, productDigits

def main():
    '''
    firstAnswer = sum_of_multiples_of_3_or_5()
    secondAnswer = sum_of_even_fibonacci_numbers()
    thirdAnswer = int(get_largest_prime_factor(600851475143))
    fourthAnswer = largest_palindrome_product()
    fifthAnswer = smallest_multiple()
    sixthAnswer = sum_square_difference()
    seventhAnswer = primes(10001)
    eighthAnswer = print(largest_product_in_series(7316717653133062491922511967442657474235534919493496983520312774506326239578318016984801869478851843858615607891129494954595017379583319528532088055111254069874715852386305071569329096329522744304355766896648950445244523161731856403098711121722383113622298934233803081353362766142828064444866452387493035890729629049156044077239071381051585930796086670172427121883998797908792274921901699720888093776657273330010533678812202354218097512545405947522435258490771167055601360483958644670632441572215539753697817977846174064955149290862569321978468622482839722413756570560574902614079729686524145351004748216637048440319989000889524345065854122758866688116427171479924442928230863465674813919123162824586178664583591245665294765456828489128831426076900422421902267105562632111110937054421750694165896040807198403850962455444362981230987879927244284909188845801561660979191338754992005240636899125607176060588611646710940507754100225698315520005593572972571636269561882670428252483600823257530420752963450, 13))
    ninthAnswer = 
    print("1. " + str(firstAnswer)   + ",\n" + 
          "2. " + str(secondAnswer)  + ",\n" + 
          "3. " + str(thirdAnswer)   + ",\n" + 
          "4. " + str(fourthAnswer)  + ",\n" +
          "5. " + str(fifthAnswer)   + ",\n" +
          "6. " + str(sixthAnswer)   + ",\n" +
          "7. " + str(seventhAnswer) + ",\n" +
          "8. " + str(eighthAnswer)  + ",\n" +
          "9. " + str(ninthAnswer))
    '''


if __name__ == "__main__":
    main()