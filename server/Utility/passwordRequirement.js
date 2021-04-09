//8 chars
const pwResearcherRequirement = {
    test: (data) => {
        data = data.toString()
        return (data.length > 7)
    }
}
//12 chars
const pwAdminRequirement = { 
    test: (data) => {
        data = data.toString()
        return (data.length > 11)
    }
}

module.exports = {
    pwResearcherRequirement: pwResearcherRequirement,
    pwAdminRequirement: pwAdminRequirement
}