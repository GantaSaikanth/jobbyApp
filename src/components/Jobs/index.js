import {Component} from 'react'
import {BsSearch} from 'react-icons/bs'
import Loader from 'react-loader-spinner'
import Cookies from 'js-cookie'
import Header from '../Header'
import JobCard from '../JobCard'

import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import './index.css'

const employmentTypesList = [
  {
    label: 'Full Time',
    employmentTypeId: 'FULLTIME',
  },
  {
    label: 'Part Time',
    employmentTypeId: 'PARTTIME',
  },
  {
    label: 'Freelance',
    employmentTypeId: 'FREELANCE',
  },
  {
    label: 'Internship',
    employmentTypeId: 'INTERNSHIP',
  },
]

const salaryRangesList = [
  {
    salaryRangeId: '1000000',
    label: '10 LPA and above',
  },
  {
    salaryRangeId: '2000000',
    label: '20 LPA and above',
  },
  {
    salaryRangeId: '3000000',
    label: '30 LPA and above',
  },
  {
    salaryRangeId: '4000000',
    label: '40 LPA and above',
  },
]

const locationTypeCheckedList = [
  {location: 'Hyderabad', locationTypeId: 'HYDERABAD'},
  {location: 'Bangalore', locationTypeId: 'BANGALORE'},
  {location: 'Chennai', locationTypeId: 'CHENNAI'},
  {location: 'Mumbai', locationTypeId: 'MUMBAI'},
  {location: 'Delhi', locationTypeId: 'DELHI'},
]

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

const apiStatusConstantsForJobs = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class Jobs extends Component {
  state = {
    profileDetails: {},
    apiStatusForProfile: apiStatusConstants.initial,
    apiForJobs: apiStatusConstantsForJobs.initial,
    searchInput: '',
    activeSalaryRangeId: '',
    jobsList: [],
    employmentTypesChecked: [],
    locationTypeChecked: '',
  }

  componentDidMount() {
    this.getProfile()
    this.getJobs()
  }

  updateEmploymentTypesChecked = typeId => {
    const {employmentTypesChecked} = this.state
    let updatedList = employmentTypesChecked
    if (employmentTypesChecked.includes(typeId)) {
      updatedList = employmentTypesChecked.filter(
        eachType => eachType !== typeId,
      )
    } else {
      updatedList = [...updatedList, typeId]
    }

    this.setState({employmentTypesChecked: updatedList}, this.getJobs)
  }

  updateLocationTypeChecked = locationTypeId => {
    this.setState({locationTypeChecked: locationTypeId}, this.getJobs)
  }

  updateSalaryRangeId = activeSalaryRangeId =>
    this.setState({activeSalaryRangeId}, this.getJobs)

  getJobs = async () => {
    this.setState({apiForJobs: apiStatusConstantsForJobs.inProgress})

    const {
      searchInput,
      employmentTypesChecked,
      activeSalaryRangeId,
      locationTypeChecked,
    } = this.state
    console.log(employmentTypesChecked)
    console.log(locationTypeChecked)
    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = `https://apis.ccbp.in/jobs?employment_type=${employmentTypesChecked}&minimum_package=${activeSalaryRangeId}&search=${searchInput}&location=${locationTypeChecked}`

    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apiUrl, options)
    const data = await response.json()
    if (response.ok === true) {
      const {jobs} = data
      const updatedData = jobs.map(eachJob => ({
        companyLogoUrl: eachJob.company_logo_url,
        employmentType: eachJob.employment_type,
        id: eachJob.id,
        jobDescription: eachJob.job_description,
        location: eachJob.location,
        packagePerAnnum: eachJob.package_per_annum,
        rating: eachJob.rating,
        title: eachJob.title,
      }))
      this.setState({
        jobsList: updatedData,
        apiForJobs: apiStatusConstantsForJobs.success,
      })
    } else {
      this.setState({apiForJobs: apiStatusConstantsForJobs.failure})
    }
  }

  getProfile = async () => {
    this.setState({apiStatusForProfile: apiStatusConstants.inProgress})
    const jwtToken = Cookies.get('jwt_token')
    const url = 'https://apis.ccbp.in/profile'
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }

    const response = await fetch(url, options)
    const data = await response.json()
    if (response.ok === true) {
      const fetchedData = {
        name: data.profile_details.name,
        profileImageUrl: data.profile_details.profile_image_url,
        shortBio: data.profile_details.short_bio,
      }
      this.setState({
        profileDetails: fetchedData,
        apiStatusForProfile: apiStatusConstants.success,
      })
    } else {
      this.setState({apiStatusForProfile: apiStatusConstants.failure})
    }
  }

  renderProfile = () => {
    const {profileDetails} = this.state
    const {name, profileImageUrl, shortBio} = profileDetails

    return (
      <div className="profile-details-container">
        <img src={profileImageUrl} alt="profile" className="profile-image" />
        <h1 className="profile-name">{name}</h1>
        <p className="profile-bio">{shortBio}</p>
      </div>
    )
  }

  renderFailure = () => (
    <div className="profile-failure-container">
      <button className="retry-button" type="button" onClick={this.getProfile}>
        Retry
      </button>
    </div>
  )

  renderLoader = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  getProfileList = () => {
    const {apiStatusForProfile} = this.state

    switch (apiStatusForProfile) {
      case apiStatusConstants.success:
        return this.renderProfile()
      case apiStatusConstants.failure:
        return this.renderFailure()
      case apiStatusConstants.inProgress:
        return this.renderLoader()
      default:
        return null
    }
  }

  renderNoJobsView = () => (
    <div className="no-jobs-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
        alt="no jobs"
        className="no-jobs-image"
      />
      <h1 className="no-jobs-heading">No Jobs Found</h1>
      <p className="no-jobs-description">
        We could not find any jobs. Try other filters.
      </p>
    </div>
  )

  onSuccessForJobs = () => {
    const {jobsList} = this.state
    return (
      <>
        {jobsList.length > 0 ? (
          <ul className="jobs-list">
            {jobsList.map(eachJob => (
              <JobCard key={eachJob.id} jobDetails={eachJob} />
            ))}
          </ul>
        ) : (
          this.renderNoJobsView()
        )}
      </>
    )
  }

  onFailureForJobs = () => (
    <div className="jobs-api-failure-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
        className="job-api-failure-image"
      />
      <h1 className="failure-view-heading">Oops! Something Went Wrong</h1>
      <p className="failure-view-description">
        We cannot seem to find the page you are looking for.
      </p>
      <button
        type="button"
        className="retry-button"
        onClick={() => this.getJobs()}
      >
        Retry
      </button>
    </div>
  )

  renderLoaderForJobs = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  getJobsList = () => {
    const {apiForJobs} = this.state

    switch (apiForJobs) {
      case apiStatusConstantsForJobs.success:
        return this.onSuccessForJobs()
      case apiStatusConstantsForJobs.failure:
        return this.onFailureForJobs()
      case apiStatusConstantsForJobs.inProgress:
        return this.renderLoaderForJobs()
      default:
        return null
    }
  }

  onChangeSearch = event => {
    this.setState({searchInput: event.target.value})
  }

  searchIcon = () => {
    this.getJobs()
  }

  render() {
    const {activeSalaryRangeId} = this.state

    return (
      <>
        <Header />
        <div className="seperator">
          <div className="jobs-container">
            {this.getProfileList()}
            <hr />
            <div className="tabs-lists">
              <h1>Type of Employment</h1>
              <ul className="tab">
                {employmentTypesList.map(eachType => {
                  const updateTypeslist = () =>
                    this.updateEmploymentTypesChecked(eachType.employmentTypeId)

                  return (
                    <li className="emp-para" key={eachType.employmentTypeId}>
                      <input
                        type="checkbox"
                        id={eachType.employmentTypeId}
                        onChange={updateTypeslist}
                      />
                      <label
                        className="lebel"
                        htmlFor={eachType.employmentTypeId}
                      >
                        {eachType.label}
                      </label>
                    </li>
                  )
                })}
              </ul>
            </div>

            <hr />
            <div className="tabs-lists">
              <h1>Salary Range</h1>
              <ul className="tab">
                {salaryRangesList.map(eachType => {
                  const onChangeRange = () => {
                    this.updateSalaryRangeId(eachType.salaryRangeId)
                  }

                  const isChecked =
                    eachType.salaryRangeId === activeSalaryRangeId

                  return (
                    <li className="emp-para" key={eachType.salaryRangeId}>
                      <input
                        type="radio"
                        id={eachType.salaryRangeId}
                        onChange={onChangeRange}
                        checked={isChecked}
                        name="package"
                      />
                      <label className="lebel" htmlFor={eachType.salaryRangeId}>
                        {eachType.label}
                      </label>
                    </li>
                  )
                })}
              </ul>

              <div className="tabs-lists">
                <h1>Location</h1>
                <ul className="tab">
                  {locationTypeCheckedList.map(eachType => {
                    const updatedLocationTypeList = () =>
                      this.updateLocationTypeChecked(eachType.locationTypeId)

                    return (
                      <li className="emp-para" key={eachType.locationTypeId}>
                        <input
                          type="radio"
                          id={eachType.locationTypeId}
                          onChange={updatedLocationTypeList}
                          name="locations"
                        />
                        <label
                          className="lebel"
                          htmlFor={eachType.locationTypeId}
                        >
                          {eachType.location}
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </div>
          <div className="other-tabs">
            <div className="search-container">
              <input
                type="search"
                className="search-input"
                placeholder="search"
                onChange={this.onChangeSearch}
              />
              <button
                className="button-search"
                aria-label="search-button"
                data-testid="searchButton"
                type="button"
                onClick={this.searchIcon}
              >
                <BsSearch className="search-icon" />
              </button>
            </div>
            {this.getJobsList()}
          </div>
        </div>
      </>
    )
  }
}

export default Jobs
