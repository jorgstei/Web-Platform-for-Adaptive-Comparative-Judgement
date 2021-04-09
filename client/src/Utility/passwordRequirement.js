export const pwResearcherRequirement = {
    test: (data) => {
        data = data.toString()
        return (data.length > 7)
    }
}
//12 chars
export const pwAdminRequirement = {
    test: (data) => {
        data = data.toString()
        return (data.length > 11)
    }
}