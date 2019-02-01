getLetterFreq=text=>Object.entries(text.toLowerCase().replace(/[^a-z]/g, "").split("").reduce((obj, char) => {
	obj[char] = (obj[char] + 1) || 1;
	return obj;
}, {})).sort((a, b) => b[1] - a[1]).reduce((str, char) => str += char[0], "")
letters = "etaoinsrhlducmfpgwybvkxjqz"

replaceAll = (str, search, replacement) => {
    return str.split(search).join(replacement);
}

forceFrequency = text => {
    freq=getLetterFreq(text)
	letters.split("").forEach((letter, i)=>{
        if(letter !== freq[i]){
			console.log("replace all", letter, freq[i])
            text = replaceAll(text, letter, freq[i]);
        }
    })
	return text;
}
forceFrequency($0.innerText)
